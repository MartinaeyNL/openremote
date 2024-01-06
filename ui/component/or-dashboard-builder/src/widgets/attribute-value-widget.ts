import {html, PropertyValues, TemplateResult } from "lit";
import {OrAssetWidget} from "../util/or-asset-widget";
import {WidgetConfig} from "../util/widget-config";
import {AssetModelUtil, AttributeRef} from "@openremote/model";
import { customElement } from "lit/decorators.js";
import {WidgetManifest} from "../util/or-widget";
import {WidgetSettings} from "../util/widget-settings";
import {AttributeValueSettings} from "../settings/attribute-value-settings";
import { when } from "lit/directives/when.js";
import {i18next} from "@openremote/or-translate";
import {Util} from "@openremote/core";
import { styleMap } from "lit/directives/style-map.js";

export interface AttributeValueWidgetConfig extends WidgetConfig {
    attributeRefs: AttributeRef[];
    horizontalAlign: 'left' | 'center' | 'right',
    verticalAlign: 'top' | 'center' | 'bottom',
    fontWeight: number
}

function getDefaultWidgetConfig() {
    return {
        attributeRefs: [],
        horizontalAlign: 'center',
        verticalAlign: 'center',
        fontWeight: 500
    } as AttributeValueWidgetConfig
}

@customElement('attribute-value-widget')
export class AttributeValueWidget extends OrAssetWidget {

    protected widgetConfig!: AttributeValueWidgetConfig;

    static getManifest(): WidgetManifest {
        return {
            displayName: "Attribute value",
            displayIcon: "tag",
            getContentHtml(config: WidgetConfig): OrAssetWidget {
                return new AttributeValueWidget(config);
            },
            getDefaultConfig(): WidgetConfig {
                return getDefaultWidgetConfig();
            },
            getSettingsHtml(config: WidgetConfig): WidgetSettings {
                return new AttributeValueSettings(config);
            }

        }
    }

    refreshContent(force: boolean): void {
        this.loadAssets(this.widgetConfig.attributeRefs);
    }

    protected updated(changedProps: PropertyValues) {

        // If widgetConfig, and the attributeRefs of them have changed...
        if(changedProps.has("widgetConfig") && this.widgetConfig) {
            const attributeRefs = this.widgetConfig.attributeRefs;
            if(attributeRefs.length > 0 && !this.isAttributeRefLoaded(attributeRefs[0])) {
                this.loadAssets(attributeRefs);
            }
        }
    }

    protected loadAssets(attributeRefs: AttributeRef[]) {
        this.fetchAssets(attributeRefs).then((assets) => {
            this.loadedAssets = assets;
        });
    }

    protected render(): TemplateResult {
        const config = this.widgetConfig;
        const attribute = (config.attributeRefs.length > 0 && this.loadedAssets[0]?.attributes) ? this.loadedAssets[0].attributes[config.attributeRefs[0].name!] : undefined;
        return html`
            ${when(config.attributeRefs.length > 0 && attribute && this.loadedAssets && this.loadedAssets.length > 0, () => {
                const descriptor = AssetModelUtil.getAttributeDescriptor(attribute!.name!, this.loadedAssets[0].type!);
                const containerStyles: {} = {
                    'height': '100%',
                    'overflow': 'hidden',
                    'container-type': 'size',
                    'display': 'flex',
                    'justify-content': this.getHorizontalAlign(config.horizontalAlign),
                    'align-items': this.getVerticalAlign(config.verticalAlign),
                }
                return html`
                    <div style="${styleMap(containerStyles)}">
                        <span style="font-size: 50cqmin; white-space: nowrap; font-weight: ${config.fontWeight};">
                            ${Util.getAttributeValueAsString(attribute!, descriptor, this.loadedAssets[0].type!, true, '-')}
                        </span>
                        <!--<svg viewBox="0 0 56 18" style="height: 100%;">
                            <text x="0" y="15">${Util.getAttributeValueAsString(attribute!, descriptor, this.loadedAssets[0].type!, true, '-')}</text>
                        </svg>-->
                    </div>
                `
            }, () => html`
                <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
                    <span>${i18next.t('noAttributesConnected')}</span>
                </div>
            `)}
        `;
    }

    protected getHorizontalAlign(align: 'left' | 'center' | 'right'): string {
        switch (align) {
            case "left":
                return 'start';
            case "right":
                return 'end';
            default:
                return 'center';
        }
    }

    protected getVerticalAlign(align: 'top' | 'center' | 'bottom'): string {
        switch (align) {
            case "top":
                return 'start';
            case "bottom":
                return 'end';
            default:
                return 'center';
        }
    }
}
