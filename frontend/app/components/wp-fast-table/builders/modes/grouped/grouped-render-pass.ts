import {WorkPackageTable} from '../../../wp-fast-table';
import {WorkPackageResourceInterface} from '../../../../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageTableRow} from '../../../wp-table.interfaces';
import {SingleRowBuilder} from '../../rows/single-row-builder';
import {collapsedRowClass} from './grouped-rows-builder';
import {GroupObject} from '../../../../api/api-v3/hal-resources/wp-collection-resource.service';
import {HalResource} from '../../../../api/api-v3/hal-resources/hal-resource.service';
import {groupClassNameFor, GroupHeaderBuilder} from './group-header-builder';
import {groupByProperty, groupedRowClassName} from './grouped-rows-helpers';
import {PlainRenderPass} from '../plain/plain-render-pass';
import {RenderedRow} from '../../primary-render-pass';

export class GroupedRenderPass extends PlainRenderPass {
  constructor(public workPackageTable:WorkPackageTable,
              public groups:GroupObject[],
              public headerBuilder:GroupHeaderBuilder,
              public colspan:number) {
    super(workPackageTable, new SingleRowBuilder(workPackageTable));
  }

  /**
   * Rebuild the entire grouped tbody from the given table
   */
  protected doRender() {
    let currentGroup:GroupObject | null = null;
    this.workPackageTable.rows.forEach((wpId:string) => {
      let row = this.workPackageTable.rowIndex[wpId];
      let nextGroup = this.matchingGroup(row.object);

      if (nextGroup && currentGroup !== nextGroup) {
        const groupClass = groupClassNameFor(nextGroup);
        let rowElement = this.headerBuilder.buildGroupRow(nextGroup, this.colspan);
        this.appendNonWorkPackageRow(rowElement, groupClass);
        currentGroup = nextGroup;
      }

      row.group = currentGroup;
      this.buildSingleRow(row);
    });
  }

  /**
   * Find a matching group for the given work package.
   * The API sadly doesn't provide us with the information which group a WP belongs to.
   */
  private matchingGroup(workPackage:WorkPackageResourceInterface) {
    return _.find(this.groups, (group:GroupObject) => {
      let property = workPackage[groupByProperty(group)];
      // explicitly check for undefined as `false` (bool) is a valid value.
      if (property === undefined) {
        property = null;
      }

      // If the property is a multi-value
      // Compare the href's of all resources with the ones in valueLink
      if (_.isArray(property)) {
        return this.matchesMultiValue(property as HalResource[], group);
      }

      //// If its a linked resource, compare the href,
      //// which is an array of links the resource offers
      if (property && property.$href) {
        return !!_.find(group._links.valueLink, (l:any):any => property.$href === l.href);
      }

      // Otherwise, fall back to simple value comparison.
      let value = group.value === '' ? null : group.value;
      return value === property;
    }) as GroupObject;
  }

  private matchesMultiValue(property:HalResource[], group:GroupObject) {
    if (property.length !== group.href.length) {
      return false;
    }

    let joinedOrderedHrefs = (objects:any[]) => {
      return _.map(objects, object => object.href).sort().join(', ');
    };

    return _.isEqualWith(
      property,
      group.href,
      (a, b) => joinedOrderedHrefs(a) === joinedOrderedHrefs(b)
    );
  }

  public augmentSecondaryElement(row:HTMLElement, rendered:RenderedRow):HTMLElement {
    if (!rendered.belongsTo) {
      return row;
    }

    const wpRow = this.workPackageTable.rowIndex[rendered.belongsTo.id];
    const group = wpRow.group;

    if (!group) {
      return row;
    }

    row.classList.add(groupedRowClassName(group.index as number));

    return row;
  }

  /**
   * Enhance a row from the rowBuilder with group information.
   */
  private buildSingleRow(row:WorkPackageTableRow):void {
    const group = row.group!;
    const hidden = group.collapsed;

    let [tr, _] = this.rowBuilder.buildEmpty(row.object);
    tr.classList.add(groupedRowClassName(group.index as number));

    if (hidden) {
      tr.classList.add(collapsedRowClass);
    }

    row.element = tr;
    this.appendRow(row.object, tr, hidden);
  }
}
