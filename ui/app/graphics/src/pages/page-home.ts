import {AppStateKeyed, Page, PageProvider} from "@openremote/or-app";
import {customElement, query, queryAll} from "lit/decorators.js";
import {TemplateResult, html, PropertyValues} from "lit";
import {Store} from '@reduxjs/toolkit';
import manager from "@openremote/core";
import {AnimationSpotifyPlayingNow} from "../animations/animation-spotify-playing-now";
import {AttributeEvent, AttributeRef} from "@openremote/model";
import "../animations/animation-spotify-playing-now";
import {AnimationComponent} from "../animations/animation-component";

export function pageHomeProvider(store: Store<AppStateKeyed>): PageProvider<AppStateKeyed> {
    return {
        name: 'home',
        routes: ['home'],
        pageCreator: () => new PageHome(store)
    };
}

@customElement("page-home")
export class PageHome extends Page<AppStateKeyed> {

    protected sub: string;

    @queryAll(".animation")
    protected animationElems?: NodeList;

    @query('animation-spotify-playing-now')
    protected spotifyPlayingNow: AnimationSpotifyPlayingNow;

    get name(): string {
        return "home";
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if(this.sub) {
            manager.events.unsubscribe(this.sub);
        }
    }

    stateChanged(state: AppStateKeyed): void {
    }

    protected firstUpdated(changedProps: PropertyValues) {
        if(this.animationElems) {
            this.subscribeToEvents(this.getAttributeRefs());
        } else {
            console.warn("animationElems was undefined!");
        }
    }

    protected async subscribeToEvents(attributeRefs: AttributeRef[]) {
        this.sub = await manager.events.subscribeAttributeEvents(attributeRefs, true, (ev) => {
            this.onAttributeUpdate(ev);
        });
    }

    protected getAttributeRefs(elems?: NodeList): AttributeRef[] {
        let attributeRefs: AttributeRef[] = [];
        elems?.forEach(e => {
            attributeRefs.push(...(e as AnimationComponent).getLiveAttributeRefs());
        });
        return attributeRefs;
    }

    protected onAttributeUpdate(event: AttributeEvent) {
        this.animationElems.forEach(n => (n as AnimationComponent).onAttributeUpdate(event));
    }

    protected render(): TemplateResult {
        return html`
            <div>
                <div>
                    <animation-spotify-playing-now class="animation" />
                </div>
            </div>
        `
    }

}
