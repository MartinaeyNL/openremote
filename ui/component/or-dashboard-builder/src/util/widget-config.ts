import { AttributeRef } from "@openremote/model";

export interface WidgetConfig {
}

export interface AssetWidgetConfig extends WidgetConfig {
    attributeRefs?: AttributeRef[];
}
