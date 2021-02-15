import {css, customElement, html, LitElement, property, PropertyValues, query, TemplateResult} from "lit-element";
import {CalendarEvent, RulesetUnion, WellknownRulesetMetaItems} from "@openremote/model";
import {OrRulesRuleChangedEvent} from "./index";
import "@openremote/or-input";
import {InputType, OrInputChangedEvent} from "@openremote/or-input";
import i18next from "i18next";
import {translate} from "@openremote/or-translate";

import {OrMwcDialog, showDialog} from "@openremote/or-mwc-components/dist/or-mwc-dialog";
import {ByWeekday, RRule, Weekday} from 'rrule'
import moment from "moment";

@customElement("or-rule-validity")
export class OrRuleValidity extends translate(i18next)(LitElement) {

    @property({type: Object})
    public ruleset?: RulesetUnion;

    @query("#radial-modal")
    protected dialog?: OrMwcDialog;

    @property()
    protected _validity?: CalendarEvent;
    @property()
    protected _rrule?: RRule;
    protected _dialog?: OrMwcDialog;

    constructor() {
        super();
    }

    public static styles = css`
        :host {
            margin-left: 20px;
        }
    `;

    protected updated(changedProps: PropertyValues) {
        super.updated(changedProps);

        if (changedProps.has("ruleset") && this.ruleset) {
            this._validity = this.ruleset.meta ? this.ruleset.meta[WellknownRulesetMetaItems.VALIDITY] as CalendarEvent : undefined;

            if (this._validity && this._validity.recurrence) {
                this._rrule = RRule.fromString(this._validity.recurrence);
            }
        }
    }

    getWeekDay(weekday: string): ByWeekday | undefined {
        switch (weekday) {
            case "MO":
                return RRule.MO
            case "TU":
                return RRule.TU
            case "WE":
                return RRule.WE
            case "TH":
                return RRule.TH
            case "FR":
                return RRule.FR
            case "SA":
                return RRule.SA
            case "SU":
                return RRule.SU
        }
    }

    isAllDay() {
        return this._validity && moment(this._validity.start).hours() === 0 && moment(this._validity.start).minutes() === 0
            && moment(this._validity.end).hours() === 23 && moment(this._validity.end).minutes() === 59;
    }

    protected setRRuleValue(value: any, key: string) {
        const origOptions = this._rrule ? this._rrule.origOptions : undefined;
        const validity = this._validity!;

        switch (key) {
            case "all-day":
                if (value) {
                    validity.start = moment(validity.start).startOf("day").toDate().getTime();
                    validity.end = moment(validity.end).endOf("day").toDate().getTime();
                } else {
                    validity.start = moment().toDate().getTime();
                    validity.end = moment().add(1, 'hour').toDate().getTime();
                }
                break;
            case "start":
                const newStartDate = moment(value);
                    if(newStartDate.isValid()) {
                    validity.start = newStartDate.set({hour:0,minute:0,second:0,millisecond:0}).toDate().getTime();
                    if (this.getValidityType() === "validityRecurrence") {
                        origOptions!.dtstart = newStartDate.toDate();
                        this._rrule = new RRule(origOptions);
                    }
                }
                break;
            case "end":
                const newEndDate = moment(value);
                if(newEndDate.isValid()) {
                    validity.end = newEndDate.set({hour:23,minute:59,second:0,millisecond:0}).toDate().getTime();
                }
                break;
            case "never-ends":
                if (value) {
                    delete origOptions!.until
                } else {
                    origOptions!.until = moment().add(1, 'year').toDate();
                }
                if (this.getValidityType() === "validityRecurrence") this._rrule = new RRule(origOptions);
                break;
            case "byweekday":
                if (!origOptions!.byweekday) origOptions!.byweekday = [];
                if (!Array.isArray(origOptions!.byweekday)) origOptions!.byweekday = [origOptions!.byweekday as ByWeekday];
                if (value.checked) {
                    const weekDay = this.getWeekDay(value.name);
                    if (weekDay) origOptions!.byweekday.push(weekDay);
                } else {
                    origOptions!.byweekday = origOptions!.byweekday.filter((day) => day !== this.getWeekDay(value.name));
                }
                if (this.getValidityType() === "validityRecurrence") this._rrule = new RRule(origOptions);
                break;
            case "until":
                if (this._rrule!.options.until) {
                    const newDate = moment(value)
                    origOptions!.until = new Date(moment(origOptions!.until).set({year: newDate.year(), month: newDate.month(), date: newDate.date()}).format())
                }
                if (this.getValidityType() === "validityRecurrence") this._rrule = new RRule(origOptions);
                break;
            case "dtstart-time":
                const timeParts = value.split(':');
                origOptions!.dtstart = moment(origOptions!.dtstart).set({hour:timeParts[0],minute:timeParts[1],second:0,millisecond:0}).toDate();
                validity.start = moment(origOptions!.dtstart).toDate().getTime();
                if (this.getValidityType() === "validityRecurrence") this._rrule = new RRule(origOptions);
                break;
            case "until-time":
                const untilParts = value.split(':');
                if (this._rrule!.options.until) {
                    origOptions!.until = moment(origOptions!.until).set({hour:untilParts[0],minute:untilParts[1],second:0,millisecond:0}).toDate()
                }
                validity.end = moment(validity.end).set({hour:untilParts[0],minute:untilParts[1],second:0,millisecond:0}).toDate().getTime();
                if(this.getValidityType() === "validityRecurrence") this._rrule = new RRule(origOptions);
                break;
        }
        this._validity = {...validity}
        this.refreshDialogContent();
    }

    timeLabel() {
        if (this.getValidityType() === "validityAlways") {
            return i18next.t("validityAlways");
        } else if (this._validity && this._rrule) {
            const validity = this._validity;
            const diff = moment(validity.end).diff(validity.start, "days");
            let diffString = "";
            if (this.isAllDay()) {
                if(diff > 0) diffString = " "+i18next.t('forDays', {days: diff});
                return this._rrule.toText() + diffString;
            } else {
                if(diff > 0) diffString = i18next.t("fromToDays", {start: moment(validity.start).format("HH:mm"), end: moment(validity.end).format("HH:mm"), days: diff })
                if(diff === 0) diffString = i18next.t("fromTo", {start: moment(validity.start).format("HH:mm"), end: moment(validity.end).format("HH:mm") })
                return this._rrule.toText() + " " + diffString;
            } 
        } else if (this._validity) {
            let format = "DD-MM-YYYY";
            if(!this.isAllDay()) format = "DD-MM-YYYY HH:mm";
            return i18next.t("activeFromTo", {start: moment(this._validity.start).format(format), end: moment(this._validity.end).format(format) })
        }
    }

    setValidityType(value: any) {
        if (!this.ruleset) return;

        if (!this.ruleset.meta) this.ruleset.meta = {};

        switch (value) {
            case "validityAlways":
                delete this.ruleset.meta[WellknownRulesetMetaItems.VALIDITY];
                this._validity = undefined;
                this._rrule = undefined;
                break;
            case "validityPeriod":
                this._validity = {
                    start: moment().startOf("day").toDate().getTime(),
                    end: moment().endOf("day").toDate().getTime()
                };
                this._rrule = undefined;
                break;
            case "validityRecurrence":
                if (!this._validity) {
                    this._validity = {
                        start: moment().startOf("day").toDate().getTime(),
                        end: moment().endOf("day").toDate().getTime()
                    };
                }
                this._rrule = new RRule({
                    freq: RRule.DAILY,
                    dtstart: new Date()
                });
                break;
        }
        this.refreshDialogContent();
    }

    getValidityType () {
        if(this._validity) {
            if (this._rrule) {
                return "validityRecurrence";
            } else {
                return "validityPeriod";
            }
        }
        return "validityAlways";
    }

    protected render() {
        if(!this.ruleset) return html``;

        return html`
            <or-input .type="${InputType.BUTTON}" .label="${this.timeLabel()}" @click="${() => this.showDialog()}"></or-input>
        `;
    }

    protected showDialog() {

        this._dialog = showDialog({
            title: i18next.t("scheduleRuleActivity"),
            actions: [
                {
                    actionName: "cancel",
                    content: html`<or-input class="button" .type="${InputType.BUTTON}" .label="${i18next.t("cancel")}"></or-input>`,
                    action: () => {
                        this._dialog = undefined;
                    }
                },
                {
                    actionName: "ok",
                    default: true,
                    content: html`<or-input class="button" .type="${InputType.BUTTON}" .label="${i18next.t("apply")}"></or-input>`,
                    action: () => {
                        if (this.ruleset && this.ruleset.meta) {
                            if (this.getValidityType() === "validityAlways") {
                                delete this.ruleset.meta[WellknownRulesetMetaItems.VALIDITY];
                            } else {
                                if (this.getValidityType() === "validityRecurrence") {
                                    this._validity!.recurrence = this._rrule!.toString().split("RRULE:")[1];
                                }
                                this.ruleset.meta[WellknownRulesetMetaItems.VALIDITY] = this._validity;
                            }
                            this.dispatchEvent(new OrRulesRuleChangedEvent(true));
                            this._dialog = undefined;
                        }
                    }
                },
            ],
            content: this.getDialogContent()
        });
    }

    protected refreshDialogContent() {
        if (!this._dialog) {
            return;
        }

        this._dialog.dialogContent = this.getDialogContent();
    }

    protected getDialogContent(): TemplateResult {
        const options = [RRule.MO.toString(), RRule.TU.toString(), RRule.WE.toString(), RRule.TH.toString(), RRule.FR.toString(), RRule.SA.toString(), RRule.SU.toString()];
        const validityTypes = ["validityAlways", "validityPeriod", "validityRecurrence"];
        const validityType = this.getValidityType();
        const selectedOptions = this._rrule && this._rrule.options && this._rrule.options.byweekday ? this._rrule.options.byweekday.map(day => new Weekday(day).toString()) : [];
        const validity = this._validity;

        return html`
            <div style="min-height: 200px; min-width: 635px; display:grid; flex-direction: row;">
                <div class="layout horizontal">
                    <or-input .value="${validityType}" .type="${InputType.SELECT}" .options="${validityTypes}" @or-input-changed="${(e: OrInputChangedEvent) => this.setValidityType(e.detail.value)}" ></or-input>
                </div>

                ${validity && (validityType  === "validityPeriod" || validityType  === "validityRecurrence") ? html`
                    <label style="display:block; margin-top: 20px;"><or-translate value="period"></or-translate></label>
                    <div style="display: flex; justify-content: space-between;" class="layout horizontal">
                        <div> 
                            <or-input value="${moment(validity.start).format("YYYY-MM-DD")}" .type="${InputType.DATE}" @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "start")}" .label="${i18next.t("from")}"></or-input>
                            <or-input .disabled=${this.isAllDay()} .value="${moment(validity.start).format("HH:mm")}" .type="${InputType.TIME}" @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "dtstart-time")}" .label="${i18next.t("from")}"></or-input>
                        </div>
                        <div>
                            <or-input .value="${moment(validity.end).format("YYYY-MM-DD")}"  .type="${InputType.DATE}" @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "end")}" .label="${i18next.t("to")}"></or-input>
                            <or-input .disabled=${this.isAllDay()} .value="${moment(validity.end).format("HH:mm")}" .type="${InputType.TIME}" @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "until-time")}" .label="${i18next.t("to")}"></or-input>
                        </div>
                    </div>  
                    
                    <div class="layout horizontal">
                        <or-input .value=${this.isAllDay()} @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "all-day")}"  .type="${InputType.CHECKBOX}" .label="${i18next.t("allDay")}"></or-input>
                    </div>
                ` : ``}
             
                ${validityType  === "validityRecurrence" ? html`
                    <label style="display: block; margin-top: 20px;"><or-translate value="repeatOccurrenceEvery"></or-translate></label>
                    <div class="layout horizontal">
                        <or-input .value="${selectedOptions}" .type="${InputType.CHECKBOX_LIST}" .options="${options}" .label="${i18next.t("daysOfTheWeek")}" @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "byweekday")}" ></or-input>
                    </div>
                    
                    <label style="display:block; margin-top: 20px;"><or-translate value="repetitionEnds"></or-translate></label>
                    <div class="layout horizontal">                        
                        <or-input .value="${!this._rrule!.options.until}"  @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "never-ends")}"  .type="${InputType.CHECKBOX}" .label="${i18next.t("never")}"></or-input>
                    </div>
                    <div class="layout horizontal">
                        <or-input ?disabled="${!this._rrule!.options.until}" .value="${this._rrule!.options.until ? moment(this._rrule!.options.until).format("YYYY-MM-DD") : moment().add(1, 'year').format('YYYY-MM-DD')}"  .type="${InputType.DATE}" @or-input-changed="${(e: OrInputChangedEvent) => this.setRRuleValue(e.detail.value, "until")}" .label="${i18next.t("to")}"></or-input>
                    </div>
                ` : ``}                
            </div>`;
    }
}
