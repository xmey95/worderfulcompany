import { Injectable } from '@angular/core';

//This service allow to block page scrolling (we need this when dialog is open)
// Solution found at https://www.bennadel.com/blog/3374-prevent-body-scrolling-with-a-windowscrolling-service-when-showing-a-modal-window-in-angular-5-0-2.htm

@Injectable()
export class BlockScrollService {

    private styleTag: HTMLStyleElement;
    constructor() {
        this.styleTag = this.buildStyleElement();
    }
    public disable() : void {
        document.body.appendChild( this.styleTag );
    }

    public enable() : void {
        document.body.removeChild( this.styleTag );
    }
    private buildStyleElement() : HTMLStyleElement {
        var style = document.createElement( "style" );
        style.type = "text/css";
        style.setAttribute( "data-debug", "Injected by WindowScrolling service." );
        style.textContent = `
            body {
                overflow: hidden !important ;
            }
        `;
        return( style );
    }
}
