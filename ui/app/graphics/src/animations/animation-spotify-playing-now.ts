import { Rive } from "@rive-app/canvas";
import {html, TemplateResult, PropertyValues} from "lit";
import {customElement, property, query} from "lit/decorators.js";
import {AnimationComponent} from "./animation-component";
import {AttributeEvent, AttributeRef} from "@openremote/model";

@customElement("animation-spotify-playing-now")
export class AnimationSpotifyPlayingNow extends AnimationComponent {

    @property()
    public songTitle: string;

    @property()
    public artistTitle: string;

    @query('#canvas')
    protected canvas: HTMLCanvasElement;

    getLiveAttributeRefs(): AttributeRef[] {
        return [
            { id: '6i1IpeWsSQ71vuQhQ5rvZh', name: "current_song_artist" },
            { id: '6i1IpeWsSQ71vuQhQ5rvZh', name: "current_song_name" }
        ];
    }

    onAttributeUpdate(ev: AttributeEvent) {
        const ref = this.getLiveAttributeRefs().find(r => r.id === ev.attributeState.ref.id && r.name === ev.attributeState.ref.name);
        if(ref) {
            switch (ev.attributeState.ref.name) {
                case "current_song_artist": this.artistTitle = ev.attributeState.value; break;
                case "current_song_name": this.songTitle = ev.attributeState.value; break;
                default: return;
            }
        }
    }

    protected createRive(): Rive {
        return new Rive({
            src: "images/spotify_now_playing_v1.riv",
            canvas: this.canvas,
            autoplay: true,
            stateMachines: "State Machine 1",
            onLoad: () => {
                this.rive.resizeDrawingSurfaceToCanvas();
            },
        });
    }

    protected willUpdate(changedProps: PropertyValues) {
        if(changedProps.has("songTitle") && changedProps.has("artistTitle")) {
            this.doAnimation(this.rive, this.songTitle, this.artistTitle);
        }
    }

    protected render(): TemplateResult {
        return html`
            <canvas id="canvas" width="750" height="100"></canvas>
        `;
    }

    protected async doAnimation(rive: Rive = this.rive, songTitle: string, artistTitle: string) {
        if(rive && !this.isPlaying) {

            this.isPlaying = true;
            const prevArtist = rive.getTextRunValue("artist_title");
            const prevSong = rive.getTextRunValue("song_title");

            // Update values if not set yet
            if(!prevArtist) {
                rive.setTextRunValue("artist_title", artistTitle);
            }
            if(!prevSong) {
                rive.setTextRunValue("song_title", songTitle);
            }
            // Play container enter, and wait
            await this.playAnimationAndWait("Spotify - Container enter", 2000);

            // Exit the text for replacement
            if(prevArtist || prevSong) {
                await this.playAnimationAndWait("Details exit", 1000);
            }
            // Replace text
            if(prevArtist || prevSong) {
                rive.setTextRunValue("artist_title", artistTitle);
                rive.setTextRunValue("song_title", songTitle);
            }
            // Enter the text again
            if(prevArtist || prevSong) {
                await this.playAnimationAndWait("Details enter", 1000);
            }

            // Wait 20 seconds before the animation disappears
            await new Promise(r => setTimeout(r, 20000));

            // Move container out of the way
            await this.playAnimationAndWait("Spotify - Container exit", 1000);

            this.isPlaying = false;
        }
    }
}
