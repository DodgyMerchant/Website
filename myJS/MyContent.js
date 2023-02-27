/**
 * @file Collection of code that manages content.
 * @author Dodgy_Merchant <admin@dodgymerchant.dev>
 * @version 2.0.0
 */

import MyTags from "../myJS/MyTags.js";
import { MyArr, MyHTML } from "./MyJS.js";

/**
 * tracks and manages its content.
 * Content is a HTML element.
 */
class Content {
  /**
   * manager
   * @type {ContentManager}
   */
  manager;
  /**
   * content elmeent this object manages.
   * @type {HTMLElement}
   */
  target;
  /**
   * @type {string[]}
   */
  tags;

  /**
   * @type {boolean} active
   */
  _active = false;
  get active() {
    return this._active;
  }
  set active(bool) {
    this._active = bool;

    if (bool) {
      MyHTML.addClass(this.target, this.manager.filteredClassActive);
    } else {
      MyHTML.removeClass(this.target, this.manager.filteredClassActive);
    }
  }

  /**
   *
   * @param {ContentManager} manager
   * @param {HTMLElement} target
   * @param {string[]} tags
   */
  constructor(manager, target, tags) {
    this.manager = manager;
    this.target = target;
    this.tags = tags;
  }
}

/**
 * @typedef {Object} ContentData content data object containing all data for a content block.
 * @property {string} headline text
 * @property {string} sub text
 * @property {string} dateStart text
 * @property {string} dateEnd text
 * @property {string} imageAlt desc
 * @property {string} imageURL desc
 * @property {string} text desc
 * @property {string[]} tags desc
 */
/**
 * ContentManager Object.
 */
export default class ContentManager {
  //#region configurable

  //#endregion
  //#region filter elements

  /**
   * name of the class that designamtes an HTML element as a filter button.
   * @type {string}
   */
  filterClassName;
  /**
   * class name of active filters
   * @type {string}
   */
  filterClassActive;
  /**
   * Maximum number of filters. -1 for infinite.
   * @type {number}
   */
  filterNumMax;

  /**
   * If the system allows the unselection of the last filters resulting in an empty list.
   * Defaults to true.
   * @type {boolean}
   */
  zeroSelect;
  /**
   * If the system should use fallback.
   * Fallback sets the filter list to the filter fallback list if the filter list is empty.
   * Preventing the filter list from being empty.
   * Defaults to true.
   * @type {boolean}
   */
  filterFallback;
  /**
   * Filter Used On Ititialization.
   * Defaults to "all".
   * Used as default fallback filter.
   * @type {string[]}
   */
  filterflbList;

  /**
   * how many tags in the filter ellement have to match for the object to be active.
   * @type {import("../myJS/MyTags.js").TagBehavior}
   */
  filterBehavior = "all";

  //#endregion filter
  //#region filtered elements
  /**
   * name of the class that designamtes an HTML element as a filtered Element.
   * @type {string}
   */
  filteredClassName;
  /**
   * class name of active filters
   * @type {string}
   */
  filteredClassActive;

  /**
   * how many tags in the filtered element have to match for the object be displayed.
   * @type {import("../myJS/MyTags.js").TagBehavior}
   */
  filteredBehavior = "match";

  //#endregion filtered
  //#region tags and filters

  /**
   * map of all tags
   * @type {Map<string, any>}
   */
  // tagMap = new Map();

  /**
   * @type {string[]}
   */
  activeFilters = [];

  //#endregion filtered
  //#region Content Objects
  /**
   * @type {Content}
   */
  contentList = [];

  //#endregion Content Objects

  /**
   * create a ContentManager instance that manages given content via filters.
   * Filter Elements must have their filter-tags in their class string following the Filter Class Designator.
   * If one filter has multiple tags they must only be seperated by "," f.e: "tag1,tag2,tag3".
   * The "all" filter is reserved to display all filtered items and will be auto removed from the list if any other tag is present..
   * If no filters are selected fallback will be used and the fallback list will be applied.
   * If fallback is not used and filters are empty the system will treat it as if the "all" filter is used.
   * @param {{element: HTMLElement, tags: string[]}[]} elements list of HTMLElements to manage.
   * @param {string} filterClassName HTML class name of filter designated elements. will be given interaction events.
   * @param {string | undefined} filterClassActive Name of the class set to a filter if its tags are in use. Used to Highlight active filters.
   * @param {string} filteredClassName HTML class name of a cotnent/filtered HTML element.
   * @param {string} filteredClassActive Name of the class set to a filtered object if is can be displayed.
   * @param {string} filterNumMax Maximum number of filters. -1 for infinite.
   * @param {string[]=} filterInit Ffilters to apply on init. defaults to "all".
   * @param {boolean=} zeroSelect If the system allows the unselection of the last filters resulting in an empty list. Defaults to true.
   * @param {boolean=} filterFallback If the system should apply the Fallback-Filter if no filters are selected. Defauts to true.
   * @param {string[]=} filterflbList Filter List to use as fallback. Defaults to init filter.
   */
  constructor(
    elements,
    filterClassName,
    filterClassActive,
    filteredClassName,
    filteredClassActive,
    filterNumMax,
    filterInit = ["all"],
    zeroSelect = true,
    filterFallback = true,
    filterflbList = filterInit
  ) {
    //#region filter

    this.filterClassName = filterClassName;
    this.filterClassActive = filterClassActive;
    this.filterNumMax = filterNumMax;

    //perform filter setup on all filters
    let filter = document.getElementsByClassName(this.filterClassName);
    for (let i = 0; i < filter.length; i++) {
      this.filterSetup(filter[i]);
    }

    //#endregion filter
    //#region filtered

    elements.forEach((element) => {
      this.contentList.push(new Content(this, element.element, element.tags));
    });
    //add new content Obj to manager.

    this.filteredClassName = filteredClassName;
    this.filteredClassActive = filteredClassActive;

    //#endregion filter

    this.zeroSelect = zeroSelect;
    this.filterFallback = filterFallback;
    this.filterflbList = filterflbList;
    this.FilterApply(filterInit.slice());
  }

  /**
   * update html elements
   * @param {string[]} tags
   */
  FilterApply(tags = this.activeFilters) {
    //#region preprocess filters

    //remove "all" filter
    if (tags.length > 1 && tags.includes("all"))
      MyArr.remove(tags, tags.indexOf("all"));

    //fallback on list empty
    if (tags.length == 0 && this.filterFallback) {
      tags.push(...this.filterflbList);
    }

    //#endregion preprocess filters

    this.activeFilters = tags;

    console.log("Filters: ", this.activeFilters);

    //filtered
    /**
     * @type {Content}
     */
    let cont;
    for (let i = 0; i < this.contentList.length; i++) {
      cont = this.contentList[i];
      if (
        this.TagCheck(cont, this.activeFilters, this.filteredBehavior) ||
        this.activeFilters.includes("all")
      ) {
        cont.active = true;
      } else {
        cont.active = false;
      }
    }

    //filter
    //go through all filter and add/remove active class
    if (this.filterClassActive) {
      let filterList = document.getElementsByClassName(this.filterClassName);
      let filter;
      for (let i = 0; i < filterList.length; i++) {
        filter = filterList[i];
        if (this.TagCheck(filter, this.activeFilters, this.filterBehavior)) {
          // console.log('filter "', filter.textContent, '" set to active');
          MyHTML.addClass(filter, this.filterClassActive);
        } else {
          MyHTML.removeClass(filter, this.filterClassActive);
        }
      }
    }
  }

  /**
   * checks if the given target tag list corresponds to the source tag list with the given gebavior.
   * If target object tag list is empty will only be drawn if the filtered tags are also empty.
   * @param {HTMLElement | Content} element element to check tags against.
   * @param {string[]=} filterTags List of Tags to filter by. If no tags are given it will always return true.
   * @param {import("../myJS/MyTags.js").TagBehavior=} behavior "one" or more. "all" or more. "exact"ly the items, no more or less.
   * @returns {boolean}
   */
  TagCheck(element, filterTags, behavior) {
    if (element instanceof Content) {
      return MyTags.Compare(
        element.tags,
        filterTags,
        behavior ? behavior : this.filteredBehavior
      );
    } else if (
      element.className.split(" ").indexOf(this.filterClassName) != -1
    ) {
      return MyTags.Compare(
        this.getTags(element),
        filterTags,
        behavior ? behavior : this.filterBehavior
      );
    }
  }

  /**
   * get tags of a given HTMLElement
   * @param {HTMLElement} elem
   */
  getTags(elem) {
    let classList = elem.className.split(" ");

    let num = classList.indexOf(this.filterClassName);

    return classList[num + 1].split(",");
  }

  /**
   * sets up the Filter HTMLElements with events for filtering.
   * @param {HTMLElement} filterEl
   */
  filterSetup(filterEl) {
    if (!MyHTML.hasClass(filterEl, "all")) {
      //all not "all" buttons
      filterEl.addEventListener("click", (event) => {
        let _t = event.target;

        if (this.TagCheck(_t, this.activeFilters, this.filterBehavior)) {
          // if (MyHTML.hasClass(_t, this.filterClassActive)) {
          this.removeFilter(this.getTags(_t));
        } else {
          this.addFilter(this.getTags(_t));
        }

        this.FilterApply();
      });
    } else {
      //"all" button
      filterEl.addEventListener("click", () => {
        this.FilterApply(["all"]);
      });
    }
  }

  /**
   * adds tags to filter
   * @param {string[]} tags
   */
  addFilter(tags) {
    MyArr.pushUniqueList(this.activeFilters, tags);

    //reduce to maximum length
    if (
      this.filterNumMax != -1 &&
      this.activeFilters.length > this.filterNumMax
    )
      this.activeFilters.splice(
        0,
        this.activeFilters.length - this.filterNumMax
      );
  }

  /**
   * removes tags from filter
   * @param {string[]} tags
   */
  removeFilter(tags) {
    if (!this.zeroSelect) {
      //id the list cant be empty
      let copy = this.activeFilters.slice();

      MyArr.removeList(copy, tags);
      if (copy.length != 0) this.activeFilters = copy;
    } else MyArr.removeList(this.activeFilters, tags);
  }
}