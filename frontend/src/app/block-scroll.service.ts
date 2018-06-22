import { Injectable } from '@angular/core';

/**
 * This service allow to block page scrolling (we need this when login dialog is open or sidebar is expanded on mobile devices)
 *
 * NOTE: Solution found at https://www.bennadel.com/blog/3374-prevent-body-scrolling-with-a-windowscrolling-service-when-showing-a-modal-window-in-angular-5-0-2.htm
 */
@Injectable()
export class BlockScrollService {

    private styleTag: HTMLStyleElement;
    constructor() {
        //builds overflow:hidden property, it can be added to body element to disable scroll
        this.styleTag = this.buildStyleElement();
    }

    /**
     * Disable window scroll
     */
    public disable() : void {
        //add property to body
        document.body.appendChild( this.styleTag );
    }

    /**
     * Enable window scroll
     */
    public enable() : void {
        //remove property from body
        document.body.removeChild( this.styleTag );
    }

    //build property to be appended to body element to disable scroll
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
