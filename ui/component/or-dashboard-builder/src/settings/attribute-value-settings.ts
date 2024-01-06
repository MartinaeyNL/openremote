import {css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import {AssetWidgetSettings} from "../util/or-asset-widget";
import {AttributeValueWidgetConfig} from "../widgets/attribute-value-widget";
import {i18next} from "@openremote/or-translate";
import {AttributesSelectEvent} from "../panels/attributes-panel";
import { InputType, OrInputChangedEvent } from "@openremote/or-mwc-components/or-mwc-input";

const styling = css`
  .switch-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

@customElement('attribute-value-settings')
export class AttributeValueSettings extends AssetWidgetSettings {

    protected readonly widgetConfig!: AttributeValueWidgetConfig;

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
                
                <!-- Other -->
                <settings-panel displayName="General" expanded="${true}">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div class="switch-container">
                            <span>Horizontal Alignment</span>
                            <or-mwc-input .type="${InputType.SELECT}" .value="${this.widgetConfig.horizontalAlign}" .options="${['left', 'center', 'right']}"
                                          @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onHorizontalAlignSelect(ev)}"
                            ></or-mwc-input>
                        </div>
                        <div class="switch-container">
                            <span>Vertical Alignment</span>
                            <or-mwc-input .type="${InputType.SELECT}" .value="${this.widgetConfig.verticalAlign}" .options="${['top', 'center', 'bottom']}"
                                          @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onVerticalAlignSelect(ev)}"
                            ></or-mwc-input>
                        </div>
                        <div class="switch-container">
                            <span>Font weight</span>
                            <or-mwc-input .type="${InputType.SELECT}" .value="${this.widgetConfig.fontWeight}" .options="${[100, 200, 300, 400, 500, 600, 700, 800]}"
                                          @or-mwc-input-changed="${(ev: OrInputChangedEvent) => this.onFontWeightSelect(ev)}"
                            ></or-mwc-input>
                        </div>
                    </div>
                </settings-panel>
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

    protected onHorizontalAlignSelect(ev: OrInputChangedEvent) {
        this.widgetConfig.horizontalAlign = ev.detail.value;
        this.notifyConfigUpdate();
    }

    protected onVerticalAlignSelect(ev: OrInputChangedEvent) {
        this.widgetConfig.verticalAlign = ev.detail.value;
        this.notifyConfigUpdate();
    }

    protected onFontWeightSelect(ev: OrInputChangedEvent) {
        this.widgetConfig.fontWeight = ev.detail.value;
        this.notifyConfigUpdate();
    }

}
