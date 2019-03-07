/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-menu-button/paper-menu-button.js";
import "@polymer/paper-listbox/paper-listbox.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "@polymer/iron-icons/iron-icons.js";


/**
 *### oe-side-nav-item
 * 
 * The `oe-side-nav-item` component is used in `oe-side-nav` component to display navigation links and their children if available.
 * 
 * The component recursively displays the navigation links and their children.
 * 
 * ### Styling
 * 
 *`<oe-side-nav>` provides the following custom properties and mixins for styling:
 *
 * |Custom property | Description | Default|
 * |----------------|:-------------:|----------:|
 * |`--menu-link-color`| Color to be applied for menu item | {} |
 * 
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 */
class OeSideNavItem extends OECommonMixin(PolymerElement) {
  static get is() {
    return 'oe-side-nav-item';
  }
  static get template() {
    return html`
    <style>
    :host {
      width: 100%;
    }
   

    paper-menu-button {
      padding: 0;
      color: var(--menu-link-color);
      width:100%;
      /* background: var(--accent-color); */

      --paper-menu-button-content: {
        font-weight: normal;
      }
    }
    iron-icon {
      opacity: 0.54;

      --iron-icon-height: 18px;
      --iron-icon-width: 18px;
    }

    .icon {
      margin-right: 10px;
    }

    paper-item {
      position: relative;
      padding-right: 0;
    }

    paper-item .collapse-state-icon {
      position: absolute;
      right: 10px;
      padding: 15px 0;
      transition: 0.3s all ease-in;
    }

    paper-item.expanded .collapse-state-icon {
      transform: rotate(90deg);
    }

    paper-item a {
      color: inherit;
      width: 100%;
      height: 48px;
      text-decoration: none;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;

      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --oe-side-nav-route;
    }

    paper-item a.selected-route {
      color: var(--oe-side-nav-route-selected-color, --primary-color);

      @apply --oe-side-nav-route-selected;
    }

    paper-item div {
      color: inherit;
      width: 100%;
      height: 48px;
      text-decoration: none;
      cursor: pointer;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;

      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --oe-side-nav-route;
    }

    paper-item div.selected-route {
      color: var(--oe-side-nav-route-selected-color, --primary-color);

      @apply --oe-side-nav-route-selected;
    }

    .title {
      width: calc(100% - 55px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

  </style>

    <paper-menu-button no-animations>
      <template is="dom-repeat" items={{navItems}} id="items">
        <template is="dom-if" if=[[!nested]]>
          <paper-item slot="dropdown-trigger" class="dropdown-trigger [[_computeExpandedClass(item.opened)]]"  on-keydown="openPage">
            <a class$="[[_computeSelectedRouteClass(item,selectedRoute)]]" on-tap="_pageSelected" data-route="[[item.name]]" href="[[item.url]]">
              <iron-icon class="icon" icon="[[item.icon]]"></iron-icon>
              <oe-i18n-msg class="title" msgid="[[item.label]]"> [[item.label]]</oe-i18n-msg>
            </a>
            <template is="dom-if" if="[[item.children.length]]">
              <iron-icon hidden$=[[!nested]] class="collapse-state-icon" icon="icons:chevron-right"></iron-icon>
            </template>
          </paper-item>
        </template>
        <template is="dom-if" if=[[nested]]>
          <paper-listbox class="nav-link-submenu"> 
            <iron-collapse opened="{{item.opened}}">
              <paper-item slot="dropdown-trigger" class="dropdown-trigger [[_computeExpandedClass(item.opened)]]" on-keydown="openPage">
                <template is="dom-if" if="[[item.children.length]]">
                  <div class$="[[_computeSelectedRouteClass(item,selectedRoute)]]" on-tap="_pageSelected" data-route="[[item.name]]">
                    <iron-icon class="icon" icon=[[item.icon]]></iron-icon>
                    <oe-i18n-msg class="title" msgid="[[item.label]]"> [[item.label]]</oe-i18n-msg>
                  </div>
                  <iron-icon class="collapse-state-icon" icon="icons:chevron-right"></iron-icon>
                </template>
                <template is="dom-if" if="[[!item.children.length]]">
                  <a class$="[[_computeSelectedRouteClass(item,selectedRoute)]]" on-tap="_pageSelected" data-route="[[item.name]]" href="[[item.url]]">
                    <iron-icon class="icon" icon=[[item.icon]]></iron-icon>
                    <oe-i18n-msg class="title" msgid="[[item.label]]"> [[item.label]]</oe-i18n-msg>
                  </a>
                </template>
              </paper-item>
              <template is="dom-if" if="[[item.children.length]]">
                <paper-listbox id="menu" slot="dropdown-content">
                  <paper-item>
                    <oe-side-nav-item no-links=[[noLinks]] nested=[[nested]] id="child-nav-item" selected-route={{selectedRoute}} nav-items={{item.children}}
                      level=[[nextLevel]]></oe-side-nav-item>
                  </paper-item>
                </paper-listbox> 
              </template>
            </iron-collapse>
          </paper-listbox> 
        </template>
      </template>
    </paper-menu-button>
  `;
  }
  static get properties() {
    return {
      /**
       * Array of navigation links to show.
       */
      navItems: {
        type: Array,
        value: function () {
          return [];
        }
      },
      /**
       * Contains the currently selected Route.
       */
      selectedRoute: {
        type: Object,
        notify: true
      },
      noLinks: {
        type: Boolean,
        value: false
      },
      /**
       * Current level of nav links.
       */
      level: {
        type: Number,
        value: 0
      },
      /**
       * Shows children in collapsible container if `true`.
       */
      nested: {
        type: Boolean,
        value: false
      }
    };
  }
  /**
   * Sets the clicked route to `selectedRoute` variable.
   * @param {Event} e change event from input.
   */
  _pageSelected(e) {
    this.set('selectedRoute', null);
    this.set('selectedRoute', e.model.item);
    if (this.noLinks) {
      e.preventDefault();
    }
  }
  /**
   * Opens the page associated with the item, when `enter` is pressed.
   * @param {Event} e change event from input.
   */
  openPage(e) {
    if (e.which == 13) {
      e.target.click();
      e.target.children[0].click();
    }
  }
  /**
   * compares the selected route and returns class name.
   * @param {Object} item compared with `selectedRoute` variable.
   * @param {Object} selectedRoute Contains the currently selected Route.
   * @return {Object} selectedRoute.
   */
  _computeSelectedRouteClass(item, selectedRoute) {
    return item == selectedRoute ? 'selected-route' : '';
  }
  /**
   * opened has a value then it returns expanded class.
   * @param {item} opened property of item.
   * @return {HTMLElement} property of paper-item component.
   */
  _computeExpandedClass(opened) {
    return opened ? 'expanded' : '';
  }
  /**
   * Incrementing level to nextLevel.
   */
  /*global someFunction nextLevelFun:true*/
  /*eslint no-undef: "error"*/
  nextLevelFun() {
    this.nextLevel = this.level + 1;
  }
  /**
   * Connected callback to handle templating if custom template is present.
   */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change',this.nextLevelFun.bind(this));
  }
}
window.customElements.define(OeSideNavItem.is, OeSideNavItem);

