import {css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import {AssetWidgetSettings} from "../util/or-asset-widget";
import {i18next} from "@openremote/or-translate";
import {AttributesSelectEvent} from "../panels/attributes-panel";
import {ButtonStateConfig, ButtonWidgetConfig} from "../widgets/button-widget";
import { when } from "lit/directives/when.js";
import { InputType, OrInputChangedEvent } from "@openremote/or-mwc-components/or-mwc-input";

const styling = css`
  .switch-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

@customElement('button-settings')
export class ButtonSettings extends AssetWidgetSettings {

    protected readonly widgetConfig!: ButtonWidgetConfig;

    static get styles() {
        return [...super.styles, styling];
    }

    protected render(): TemplateResult {
        return html`
            <div>
                <!-- Attribute selection -->
                <settings-panel displayName="${i18next.t('attributes')}" expanded="${true}">
                    <attributes-panel .attributeRefs="${this.widgetConfig.attributeRefs}" style="padding-bottom: 12px;"
                                      @attribute-select="${(ev: AttributesSelectEvent) => this.onAttributesSelect(ev)}"
                    ></attributes-panel>
                </settings-panel>
                
                <!-- State settings -->
                <settings-panel displayName="State settings" expanded="${true}">
                    <div style="display: flex; flex-direction: column; gap: 16px;">

                        <div class="switch-container">
                            <span>Use Toggle mechanic</span>
                            <or-mwc-input .type="${InputType.SWITCH}" style="margin: 0 -10px;" .value="${this.widgetConfig.useToggle}"
                                          @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onUseToggleToggle(ev)}"
                            ></or-mwc-input>
                        </div>
                        
                        ${when(this.widgetConfig.stateOffConfig, () => html`
                            ${this.getStateTemplate((this.widgetConfig.useToggle ? "Off state" : "State Configuration"), this.widgetConfig.stateOffConfig, 'off')}
                        `)}

                        ${when(this.widgetConfig.useToggle && this.widgetConfig.stateOnConfig, () => html`
                            ${this.getStateTemplate("On state", this.widgetConfig.stateOnConfig, 'on')}
                        `)}

                    </div>
                    
                </settings-panel>
            </div>
        `;
    }

    protected getStateTemplate(headerText: string, stateConfig: ButtonStateConfig, state: 'off' | 'on'): TemplateResult {
        return html`
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #FBFBFB; border: 1px solid #E0E0E0;">
                <span>${headerText}</span>
                <div>
                    <or-mwc-input .type="${InputType.TEXT}" label="Text" .disabled="${stateConfig.showValue}" .value="${stateConfig.text}" style="width: 100%;"
                                  @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onStateTextChange(ev, state)}"
                    ></or-mwc-input>  
                </div>
                <div>
                    <or-mwc-input .type="${InputType.TEXT}" label="Icon" .value="${stateConfig.icon}" style="width: 100%;"
                                  @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onStateIconChange(ev, state)}"
                    ></or-mwc-input>
                </div>
                <div>
                    <or-mwc-input .type="${InputType.COLOUR}" label="Button color" .value="${stateConfig.color}" style="width: 100%;"
                                  @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onStateColorChange(ev, state)}"
                    ></or-mwc-input>
                </div>
                <div>
                    <or-mwc-input .type="${InputType.TEXT}" label="Attribute value" .value="${stateConfig.value}" style="width: 100%;"
                                  @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onStateValueChange(ev, state)}"
                    ></or-mwc-input>
                </div>
                <div class="switch-container">
                    <span>Show value in button</span>
                    <or-mwc-input .type="${InputType.SWITCH}" style="margin: 0 -10px;" .value="${stateConfig.showValue}"
                                  @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onShowValueToggle(ev, state)}"
                    ></or-mwc-input>
                </div>
            </div>
        `;
    }

    protected onAttributesSelect(ev: AttributesSelectEvent) {
        this.widgetConfig.attributeRefs = ev.detail.attributeRefs;
        if(ev.detail.attributeRefs.length === 1) {
            const asset = ev.detail.assets.find((asset) => asset.id === ev.detail.attributeRefs[0].id);
            if(asset) {
                this.setDisplayName!(asset.name);
            }
        }
        this.notifyConfigUpdate();
    }

    protected onUseToggleToggle(ev: OrInputChangedEvent) {
        this.widgetConfig.useToggle = ev.detail.value;
        this.notifyConfigUpdate();
    }

    protected onShowValueToggle(ev: OrInputChangedEvent, state: 'on' | 'off') {
        if(state == 'on') {
            this.widgetConfig.stateOnConfig.showValue = ev.detail.value;
        } else {
            this.widgetConfig.stateOffConfig.showValue = ev.detail.value;
        }
        this.notifyConfigUpdate();
    }

    protected onStateTextChange(ev: OrInputChangedEvent, state: 'on' | 'off') {
        if(state == 'on') {
            this.widgetConfig.stateOnConfig.text = ev.detail.value;
        } else {
            this.widgetConfig.stateOffConfig.text = ev.detail.value;
        }
        this.notifyConfigUpdate();
    }

    protected onStateIconChange(ev: OrInputChangedEvent, state: 'on' | 'off') {
        if(state == 'on') {
            this.widgetConfig.stateOnConfig.icon = ev.detail.value;
        } else {
            this.widgetConfig.stateOffConfig.icon = ev.detail.value;
        }
        this.notifyConfigUpdate();
    }

    protected onStateColorChange(ev: OrInputChangedEvent, state: 'on' | 'off') {
        if(state == 'on') {
            this.widgetConfig.stateOnConfig.color = ev.detail.value;
        } else {
            this.widgetConfig.stateOffConfig.color = ev.detail.value;
        }
        this.notifyConfigUpdate();
    }

    protected onStateValueChange(ev: OrInputChangedEvent, state: 'on' | 'off') {
        if(state == 'on') {
            this.widgetConfig.stateOnConfig.value = ev.detail.value;
        } else {
            this.widgetConfig.stateOffConfig.value = ev.detail.value;
        }
        this.notifyConfigUpdate();
    }

}
