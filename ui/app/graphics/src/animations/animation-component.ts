import { Rive } from "@rive-app/canvas";
import {LitElement, TemplateResult, PropertyValues} from "lit";
import {AttributeEvent, AttributeRef} from "@openremote/model";

export abstract class AnimationComponent extends LitElement {

    protected rive: Rive;
    protected isPlaying: boolean = false;

    public abstract getLiveAttributeRefs(): AttributeRef[];

    public abstract onAttributeUpdate(ev: AttributeEvent): void;

    protected abstract createRive(): Rive;

    protected firstUpdated(changedProps: PropertyValues) {
        this.rive = this.createRive();

        super.firstUpdated(changedProps);
    }

    protected abstract render(): TemplateResult

    protected async playAnimationAndWait(animationName: string, wait?: number) {
        this.rive.play(animationName);
        if(wait) {
            await new Promise(r => setTimeout(r, wait));
        }
    }
}
