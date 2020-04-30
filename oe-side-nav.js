/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "oe-i18n-msg/oe-i18n-msg.js";
import "@polymer/paper-menu-button/paper-menu-button.js"

import "@polymer/paper-tooltip/paper-tooltip.js";
import "@polymer/paper-toolbar/paper-toolbar.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-listbox/paper-listbox.js";
import "oe-ajax/oe-ajax.js";
import "oe-input/oe-input.js";
import "./oe-side-nav-item.js";
import "@polymer/paper-item/paper-item.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
/**
 * ### oe-side-nav
 * 
 * The `oe-side-nav` component is used to display the links from the `Navigation Links` model present under a group. The navigation link group to fetch can be specified to the `groupName` property.
 * 
 * ### Styling
 * 
 * `<oe-side-nav>` provides the following custom properties and mixins for styling:
 * 
 * |Custom property | Description | Default|
 * |----------------|:-------------:|----------:|
 * |`--oe-side-nav-toolbar` | Mixin to be applied to side nav paper toolbar | {}|
 * |`--oe-side-nav-item`  | Mixin to be applied to oe-side-nav-item element | {}|  
 * |`--oe-side-nav-route` | Mixin to be applied to a route item  | null|
 * |`--oe-side-nav-route-selected` | Mixin to be applied to the selected route item | {}|
 * |`--oe-side-nav-route-selected-color` | color to be applied to the selected route item | --primary-color|
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEAjaxMixin
 * @appliesMixin OECommonMixin
 * @demo demo/demo-oe-side-nav.html
 */
class OeSideNav extends OEAjaxMixin(OECommonMixin(PolymerElement)) {

  static get is() {
    return 'oe-side-nav';
  }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment iron-flex-layout">
      :host {
        display: block;
      }

      paper-toolbar { 
        height: 64px;

        @apply --oe-side-nav-toolbar;
      }
      
      oe-side-nav-item {
        height: calc(100vh - 64px);
        display: block;
        overflow-y: auto;
        overflow-x: hidden;

        @apply --oe-side-nav-item;
      }
     
      paper-listbox {
        padding: 0;
        width:100%;
        color: var(--menu-link-color);
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
  
      iron-icon {
        opacity: 0.54;
  
        --iron-icon-height: 18px;
        --iron-icon-width: 18px;
      }
  
      .icon {
        margin-right: 10px;
      }
  
      .dropdown-content {
        border-radius: 3px;
        border: 1px var(--divider-color) solid;
      }
  
      .search-box {
        padding-right: 10px;
        padding-left: 10px;
      }
    </style>
  
      <a id="anchorTag" hidden></a>
      <paper-toolbar>
        <paper-icon-button on-tap="_handleMenuClick" icon="menu" slot="top"></paper-icon-button>
        <div slot="top">
          <template is="dom-if" if=[[_navStack.length]]>
            <paper-menu-button>
              <paper-button slot="dropdown-trigger" alt="menu">[[title]]</paper-button>
              <paper-listbox slot="dropdown-content">
                <template is="dom-repeat" items=[[_navStack]]>
                  <paper-item on-tap="_goBack">[[item.title]]</paper-item>
                </template>
              </paper-listbox>
            </paper-menu-button>
          </template>
          <template is="dom-if" if=[[!_navStack.length]]>
            <paper-button><oe-i18n-msg msgid="[[title]]"></oe-i18n-msg></paper-button>
          </template>
        </div>
      </paper-toolbar>
      <template is="dom-if" if=[[showSearchBar]]>
        <div class="search-box">
          <oe-input no-label-float placeholder="Search Navigation Links" value="{{filterText}}">
            <iron-icon slot="suffix" icon="icons:search"></iron-icon>
          </oe-input>
        </div>
      </template>
      <template is="dom-if" if=[[filterText.length]]>
        <paper-listbox no-animations>
          <template is="dom-repeat" items=[[filteredNavList]]>
            <template is="dom-if" if=[[item.url]]>
              <paper-item on-keydown="openPage" on-tap="_pageSelected" data-route="[[item.name]]">
                  <iron-icon class="icon" icon="[[item.icon]]"></iron-icon>
                  <oe-i18n-msg class="title" msgid="[[item.label]]"></oe-i18n-msg>
              </paper-item>
            </template>
          </template>
        </paper-listbox>
      </template>
      <template is="dom-if" if=[[!filterText.length]]>
        <oe-side-nav-item no-links=[[noLinks]] 
            id="side-nav-item" nested=[[nested]] 
            selected-route={{selectedRoute}} nav-items={{navList}}
            on-navlink-clicked='_onNavLinkClicked'></oe-side-nav-item>
      </template>
      `;
  }
  static get properties() {
    return {
      /**
       * Setting to `true` makes child route to collapse under the parent route.
       */
      nested: {
        type: Boolean,
        value: false
      },
      /**
       * Number of children route level to fetch.
       */
      levelsToFetch: {
        type: Number,
        value: 2
      },
      /**
       * URL to fetch Navigation Links.
       */
      restUrl: {
        type: String,
        value: function () {
          var restApiRoot = (window.OEUtils && window.OEUtils.restApiRoot) ? window.OEUtils.restApiRoot : '/api';
          return restApiRoot + '/NavigationLinks';
        }
      },
      /**
       * Name of group to fetch.
       */
      groupName: {
        type: String,
        value: '_app_nav_group_',
        observer: '_groupNameChanged'
      },
      /**
       * Setting to `true` shows search bar in top.
       */
      showSearchBar: {
        type: Boolean,
        value: false
      },
      /**
       * Contains the currently selected Route.
       */
      selectedRoute: {
        type: Object,
        notify: true
      },
      /**
       * Set to true, When size-nav is linked directly to iron-pages and nav-items need not trigger location change 
       */
      noLinks: {
        type: Boolean,
        value: false
      },

      extraLinks: {
        type: Array,
        value: function () {
          return [];
        }
      },
      /**
       * Name property of selectedRoute variable.
       */
      title: {
        type: String
      },
      /**
       * input value taken by the oe-input. 
       */
      filterText: {
        type: String,
        value:""
      },
      /**
       * property which holds navList and title.
       */
      _navStack: {
        type: Array,
        value: function () {
          return [];
        }
      }
    };
  }
  static get observers() {
    return [
      "_selectedRouteChanged(selectedRoute)",
      "_filterNavLinks(filterText)"
    ];
  }
  /**
   * invokes _getNavLinks method.
   * @param {string} newgroup string sent as parameter.
   */
  _groupNameChanged(newgroup) {
    this._getNavLinks();
  }
  /**
   * Fetches the nav links based on a `parent`.
   * @param {string} parent used to build filter params.
   */
  _getNavLinks(parent) {
    var self = this;
    var filter = self._buildFilterParams(parent);
    self.makeAjaxCall(this.restUrl, 'get', null, null, { "filter": filter }, 'json',
      function (err, res) {

        var response = res;

        if (parent && self.selectedRoute) {

          self.set('selectedRoute.children', response.length ? response : null);

          if (self.nested) {
            self._openTillSelectedPage(self);
          } else {
            response.length && self._update_navStack(self.selectedRoute);
          }
        } else {
          var navList = response;
          if (self.extraLinks) {
            navList = navList.concat(self.extraLinks);
          }
          self.set('navList', navList);
        }
      });
  }
  /**
   * Builds filter params to fetch `Navigation Link`.
   * @param {string} parent .
   * @return {Object} filter .
   */
  _buildFilterParams(parent) {
    var filter = {};
    filter.where = parent ? {
      parent: parent
    } : {
        topLevel: true
      };
    if (!parent) {
      var includeFilter = {
        relation: 'children'
      };
      buildIncludeFilter(includeFilter, this.levelsToFetch);
      filter.include = includeFilter;
    }

    if (this.groupName && this.groupName !== '*') {
      filter.where.or = [{ group: this.groupName }, { group: '*' }];
    } else {
      filter.where.group = '*';
    }
    filter.order = 'sequence ASC';
    return filter;
  }
  /**
   * Observer called when `selectedRoute` changes. Fetch and show child routes if not available.
   * @param {Object} selectedRoute Contains the currently selected Route.
   */
  _selectedRouteChanged(selectedRoute) {

    if (!selectedRoute) return;

    if (selectedRoute.children === undefined) {

      // Next level nodes are not loaded.
      this._getNavLinks(selectedRoute.name);

    } else if (selectedRoute.children === null) {

      // Next level nodes are loaded, and there are no next level nodes (i.e) it is a leaf node.

    } else if (selectedRoute.children.length && !this.nested) {

      //Next level nodes are there.

      this._update_navStack(selectedRoute);
    }
  }
  /**
   * Updates the `_navStack` to current set of and shows the child set of nav Links.
   * @param {Object} selectedRoute Contains the currently selected Route.
   */
  _update_navStack(selectedRoute) {
    this.push('_navStack', {
      title: this.title,
      list: this.navList
    });

    this.set('navList', selectedRoute.children);

    this.set('title', selectedRoute.name);
  }
  /**
   * Handles tap or tap and hold action on tha back button.
   * Shows previous level of `Navigation Links` on tap and shows the history of levels on tap and hold.
   * @param {Event} e change event from input.
   */
  _handleBack(e) {

    /** Polymer doesn't have native on-hold event.
     * Custom implementation has made to achieve the on-hold event.
     */
    var HOLD_DELAY = 800;
    if (e.type == 'down') {

      this.backButtonHolded = false;
      this.intervalHandler = setTimeout(function () {
        this.backButtonHolded = true;
        this._handleBackHold();
      }.bind(this), HOLD_DELAY);

    } else if (e.type == 'up') {
      clearTimeout(this.intervalHandler);
      if (!this.backButtonHolded) {
        this._handleBackTap();
      }
    }
  }
  /**
   * Goes to previous level of `Navigaition Links`.
   * @param {Event} e change event from input.
   */
  _handleBackTap(e) { // eslint-disable-line no-unused-vars.
    var previousItem = this.pop('_navStack');
    this.set('navList', previousItem.list);
    this.set('title', previousItem.title);
  }
  /**
   * @param {Event} e change event from input.
   */
  _handleBackHold(e) { // eslint-disable-line no-unused-vars.
    this.show_navStackItems = true;
  }
  /**
   * Goes back to the selected level from level history menu.
   * @param {Event} e change event from input.
   */
  _goBack(e) {
    this.show_navStackItems = false;
    var index = e.model.index;
    this.splice('_navStack', index + 1);
    this._handleBackTap();
  }
  /**
   * Called when a nav link is clicked. Shows children if available.
   * @param {Event} e change event from input.
   */
  _pageSelected(e) {

    var selectedRoute = e.model.item;

    this.set('selectedRoute', selectedRoute);
    this.set('filterText', '');

    if(selectedRoute.children && selectedRoute.children.length>0){
      this._openTillSelectedPage(selectedRoute);
    } else if(!this.noLinks && selectedRoute.url) {
      this.$.anchorTag.href = selectedRoute.url;
      this.$.anchorTag.click();  
    }
  }

  _onNavLinkClicked(e){
    this.$.anchorTag.href = e.detail.url;
    this.$.anchorTag.click();
  }
  /**
   * Opens all collapsed nav content till the selected level.
   */
  _openTillSelectedPage(selectedRoute) {

    var navList = this.navList;

    var path = pathToLeafNode(navList, selectedRoute);

    path.forEach(function (node) {
      node.opened = true;
    });

    this.set('navList', []);
    this.async(function () {
      this.set('navList', navList);
    });
  }
  /**
   * Updates filtered result when `filterText` is changed.
   * @param {string} filterText .
   */
  _filterNavLinks(filterText) {
    if (filterText.length) {
      var filteredNavList = [];
      findMatchingNavItems(this.navList, filteredNavList, this.filterText);
      this.set('filteredNavList', filteredNavList);
    } else {
      this.filteredNavList = [];
    }
  }
  /**
   * Fuction invoked in connected callback.
   */
    /*global someFunction initializeFun:true*/
    /*eslint no-undef: "error"*/
  initializeFun() {
    this._navStack = [];
    this.navList = [];
    this.filteredNavList = [];
    this.filterText = '';
    this._getNavLinks(undefined);
  }
  /**
   * Connected callback to handle templating if custom template is present.
   */
  connectedCallback() {
    super.connectedCallback();
    this.initializeFun();
  }

  /**
   * @param {Event} e event on menu tap.
   */
  _handleMenuClick(e) {
    this.fire('oe-side-bar-menu-click');
  }
}
window.customElements.define(OeSideNav.is, OeSideNav);
/**
 * create include filter by checking level.
 * @param {Object} obj property of filter object.
 * @param {number} level .
 * 
 */
var buildIncludeFilter = function (obj, level) {
  if (level == 1) return;
  obj.scope = {
    include: {
      relation: 'children'
    }
  };
  buildIncludeFilter(obj.scope.include, --level);
};
/**
 * filter navList by fetching matching navItems.
 * @param {Array} navList .
 * @param {Array} filteredNavList .
 * @param {string} filterText . 
 */
var findMatchingNavItems = function (navList, filteredNavList, filterText) {
  var filterString = filterText.toLowerCase();
  navList.forEach(function (nav) {
    if (nav.label.toLowerCase().indexOf(filterString) != -1) {
      filteredNavList.push(nav);
    }
    nav.children && findMatchingNavItems(nav.children, filteredNavList, filterText);
  });
};
/**
 * create path to the leaf node.
 * @param {Array} nodeList array of navList.
 * @param {Object} leafNode is a selectedRoute.
 * @param {Array} nodeStack array having navList items.
 * @return {boolean} result
 */
var pathToLeafNode = function (nodeList, leafNode, nodeStack) {
  var result;
  nodeStack || (nodeStack = []);
  for (var i = 0, l = nodeList.length; i < l; i++) {
    var nav = nodeList[i];
    nodeStack.push(nav);
    if (nav == leafNode) {
      result = nodeStack;
      break;
    } else {
      nav.children && (result = pathToLeafNode(nav.children, leafNode, nodeStack));
      if (result) break;
      nodeStack.pop(nav);
    }
  }
  return result;
};