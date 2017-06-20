import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from '../../../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageTable} from '../../wp-fast-table';
import {commonRowClassName, rowClassName, SingleRowBuilder} from '../rows/single-row-builder';
import {
  DenormalizedRelationData,
  RelationResource
} from '../../../api/api-v3/hal-resources/relation-resource.service';
import {UiStateLinkBuilder} from '../ui-state-link-builder';
import {QueryColumn} from '../../../wp-query/query-column';
import {$injectFields} from '../../../angular/angular-injector-bridge.functions';
import {RelationColumnType} from '../../state/wp-table-relation-columns.service';
import {States} from '../../../states.service';

export function relationGroupClass(workPackageId:string) {
  return `__relations-expanded-from-${workPackageId}`;
}

export function relationIdentifier(targetId:string, workPackageId:string) {
  return `wp-relation-row-${workPackageId}-to-${targetId}`;
}

export const internalDetailsColumn = {
  id: '__internal-detailsLink'
} as QueryColumn;

export class RelationRowBuilder extends SingleRowBuilder {
  public states:States;
  public I18n:op.I18n;

  constructor(protected workPackageTable:WorkPackageTable) {
    super(workPackageTable);
    $injectFields(this, 'I18n', 'states');
  }

  /**
   * Build the columns on the given empty row
   */
  public buildEmptyRelationRow(from:WorkPackageResourceInterface, relation:RelationResource, type:RelationColumnType):[HTMLElement,WorkPackageResourceInterface] {
    const denormalized = relation.denormalized(from);

    const to = this.states.workPackages.get(denormalized.targetId).value! as WorkPackageResourceInterface;

    // Let the primary row builder build the row
    const row = this.createEmptyRelationRow(from, to);
    const [tr, _] = super.buildEmptyRow(to, row);

    return [tr, to];
  }
  /**
   * Create an empty unattached row element for the given work package
   * @param workPackage
   * @returns {any}
   */
  public createEmptyRelationRow(from:WorkPackageResource, to:WorkPackageResource) {
    let tr = document.createElement('tr');
    tr.dataset['workPackageId'] = from.id;
    tr.dataset['relatedWorkPackageId'] = from.id;
    tr.classList.add(
      rowClassName, commonRowClassName, 'issue',
      `wp-table--relations-aditional-row`, relationIdentifier(to.id, from.id), relationGroupClass(from.id)
    );

    return tr;
  }
}
