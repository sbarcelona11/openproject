import {TableRowEditContext} from '../wp-edit-form/table-row-edit-context';
import {WorkPackageEditForm} from '../wp-edit-form/work-package-edit-form';
import {injectorBridge} from '../angular/angular-injector-bridge.functions';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from '../api/api-v3/hal-resources/work-package-resource.service';
import {rowId} from '../wp-fast-table/helpers/wp-table-row-helpers';
import {States} from '../states.service';
import {WorkPackageTableSelection} from '../wp-fast-table/state/wp-table-selection.service';
import {WorkPackageTableColumnsService} from '../wp-fast-table/state/wp-table-columns.service';
import {
  internalDetailsColumn,
  rowClassName,
  SingleRowBuilder
} from '../wp-fast-table/builders/rows/single-row-builder';
import {WorkPackageTable} from '../wp-fast-table/wp-fast-table';
import {QueryColumn} from '../wp-query/query-column';
import IScope = angular.IScope;

export const inlineCreateRowClassName = 'wp-inline-create-row';
export const inlineCreateCancelClassName = 'wp-table--cancel-create-link';

export class InlineCreateRowBuilder extends SingleRowBuilder {
  // Injections
  public states:States;
  public wpTableSelection:WorkPackageTableSelection;
  public wpTableColumns:WorkPackageTableColumnsService;
  public I18n:op.I18n;

  protected text:{ cancelButton:string };

  constructor(workPackageTable: WorkPackageTable) {
    super(workPackageTable);
    injectorBridge(this);

    this.text = {
      cancelButton: this.I18n.t('js.button_cancel')
    };
  }

  public buildCell(workPackage:WorkPackageResourceInterface, column:QueryColumn):HTMLElement {
    switch (column.id) {
      case internalDetailsColumn.id:
        return this.buildCancelButton();
      default:
        return super.buildCell(workPackage, column);
    }
  }

  public buildNew(workPackage:WorkPackageResourceInterface, form:WorkPackageEditForm):[HTMLElement, boolean] {
    // Get any existing edit state for this work package
    const [row, hidden] = this.buildEmpty(workPackage);

    // Set editing context to table
    form.editContext = new TableRowEditContext(workPackage.id);
    this.states.editing.get(workPackage.id).putValue(form);

    return [row, hidden];
  }

  /**
   * Create an empty unattached row element for the given work package
   * @param workPackage
   * @returns {any}
   */
  public createEmptyRow(workPackage:WorkPackageResource) {
    const tr = document.createElement('tr');
    tr.id = rowId(workPackage.id);
    tr.dataset['workPackageId'] = workPackage.id;
    tr.classList.add(inlineCreateRowClassName, rowClassName, 'wp--row', 'issue');

    return tr;
  }

  protected buildCancelButton() {
    const td = document.createElement('td');
    td.classList.add('wp-table--cancel-create-td');

   td.innerHTML = `
    <a
       href="javascript:"
       class="${inlineCreateCancelClassName} icon icon-cancel"
       aria-label="${this.text.cancelButton}">
    </a>
   `;

    return td;
  }
}


InlineCreateRowBuilder.$inject = ['states', 'wpTableSelection', 'wpTableColumns', 'I18n'];
