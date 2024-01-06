import { customElement } from "lit/decorators.js";
import {OrAssetWidget} from "../util/or-asset-widget";
import {WidgetConfig} from "../util/widget-config";
import {AssetModelUtil, AttributeRef} from "@openremote/model";
import {WidgetManifest} from "../util/or-widget";
import {WidgetSettings} from "../util/widget-settings";
import {css, html, PropertyValues, TemplateResult } from "lit";
import {ButtonSettings} from "../settings/button-settings";
import { when } from "lit/directives/when.js";
import {i18next} from "@openremote/or-translate";
import { styleMap } from "lit/directives/style-map.js";
import manager, {Util} from "@openremote/core";

const styling = css`
  .button-wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  button {
    width: 100%;
    height: 100%;
    container-type: size;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;
export interface ButtonWidgetConfig extends WidgetConfig {
    attributeRefs: AttributeRef[];
    useToggle: boolean
    stateOffConfig: ButtonStateConfig
    stateOnConfig: ButtonStateConfig
}

export interface ButtonStateConfig {
    showValue?: boolean
    text?: string,
    icon?: string,
    color?: string,
    value?: string
}

function getDefaultWidgetConfig() {
    return {
        attributeRefs: [],
        useToggle: false,
        stateOffConfig: {
            showValue: true,
            icon: "toggle-switch-off",
            color: "#FFFFFF"
        },
        stateOnConfig: {
            showValue: true,
            icon: "toggle-switch",
            color: "#FFFFFF"
        }
    } as ButtonWidgetConfig
}

@customElement('button-widget')
export class ButtonWidget extends OrAssetWidget {

    protected widgetConfig!: ButtonWidgetConfig;

    static getManifest(): WidgetManifest {
        return {
            displayName: "Button",
            displayIcon: "button-cursor",
            getContentHtml(config: WidgetConfig): OrAssetWidget {
                return new ButtonWidget(config);
            },
            getDefaultConfig(): WidgetConfig {
                return getDefaultWidgetConfig();
            },
            getSettingsHtml(config: WidgetConfig): WidgetSettings {
                return new ButtonSettings(config);
            }
        }
    }

    static get styles() {
        return [...super.styles, styling];
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

    refreshContent(force: boolean): void {
        this.loadAssets(this.widgetConfig.attributeRefs);
    }

    protected render(): TemplateResult {
        const config = this.widgetConfig;
        const attribute = (config.attributeRefs.length > 0 && this.loadedAssets[0]?.attributes) ? this.loadedAssets[0].attributes[config.attributeRefs[0].name!] : undefined;
        return html`
            ${when(config.attributeRefs.length > 0 && attribute && this.loadedAssets && this.loadedAssets.length > 0, () => {
                const isButtonOn = (config.useToggle && config.stateOnConfig.value === String(attribute?.value));
                const stateConfig = isButtonOn ? config.stateOnConfig : config.stateOffConfig;
                const hasDisplayname = this.getDisplayName?.();
                const wrapperStyles: {} = {
                    "padding": hasDisplayname ? undefined : '4px 0',
                    "height": hasDisplayname ? '100%' : 'calc(100% - 8px)'
                }
                const buttonStyles: {} = {
                    "background-color": stateConfig.color 
                };
                return html`
                    <div class="button-wrapper" style="${styleMap(wrapperStyles)}">
                        <div style="flex: 1;">
                            <button style="${styleMap(buttonStyles)}" @click="${() => this.onButtonToggle(isButtonOn)}">
                                ${when(stateConfig.icon, () => html`
                                    <or-icon .icon="${stateConfig.icon}" style="font-size: ${stateConfig.text ? '50cqmin' : '75cqmin'}"></or-icon>
                                `)}
                                ${when(stateConfig.text || stateConfig.showValue, () => html`
                                    <span style="font-size: ${stateConfig.icon ? '20cqmin' : '50cqmin'}">
                                        ${when(stateConfig.showValue, () => {
                                            const descriptor = AssetModelUtil.getAttributeDescriptor(attribute!.name!, this.loadedAssets[0].type!);
                                            return html`${Util.getAttributeValueAsString(attribute!, descriptor, this.loadedAssets[0].type!, true, '-')}`;
                                        }, () => html`${stateConfig.text}`)}
                                    </span>
                                `)}
                            </button>
                        </div>
                    </div>
                `
            }, () => html`
                <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
                    <span>${i18next.t('noAttributesConnected')}</span>
                </div>
            `)}
        `;
    }

    protected onButtonToggle(currentState: boolean) {
        if(!this.getEditMode?.()) {
            const newState = !currentState;
            const attributeRef = this.widgetConfig.attributeRefs[0];
            const value = newState ? this.widgetConfig.stateOnConfig.value : this.widgetConfig.stateOffConfig.value;
            if(attributeRef) {
                manager.rest.api.AssetResource.writeAttributeValues([{
                    ref: this.widgetConfig.attributeRefs[0],
                    value: value
                }]).catch((reason) => {
                    console.error(reason);
                })
            } else {
                console.error("Could not toggle button; some values were not present.")
            }
        }
    }

}
