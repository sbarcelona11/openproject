import {WorkPackageTable} from '../../wp-fast-table';
import {$injectFields} from '../../../angular/angular-injector-bridge.functions';
import {WorkPackageResourceInterface} from '../../../api/api-v3/hal-resources/work-package-resource.service';
import {States} from '../../../states.service';
import {WorkPackageTableTimelineService} from '../../state/wp-table-timeline.service';
import {WorkPackageCacheService} from '../../../work-packages/work-package-cache.service';
import {commonRowClassName} from '../rows/single-row-builder';
import {rowClass} from '../../helpers/wp-table-row-helpers';

export const timelineCellClassName = 'wp-timeline-cell';

export function timelineRowIdentifier(id:string) {
  return `wp-timeline-row-${id}`;
}

export class TimelineRowBuilder {
  public states:States;
  public wpTableTimeline:WorkPackageTableTimelineService;
  public wpCacheService:WorkPackageCacheService;

  constructor(protected workPackageTable:WorkPackageTable) {
    $injectFields(this, 'states', 'wpTableTimeline', 'wpCacheService');
  }

  public build(workPackageId:string|null) {
    const cell = document.createElement('div');
    cell.classList.add(timelineCellClassName, commonRowClassName);

    if (workPackageId) {
      cell.dataset['workPackageId'] = workPackageId;
      cell.classList.add(timelineRowIdentifier(workPackageId));
    }

    return cell;
  }

  /**
   * Build and insert a timeline row for the given work package using the additional classes.
   * @param workPackage
   * @param timelineBody
   * @param rowClasses
   */
  public insert(workPackageId:string | null,
                timelineBody:DocumentFragment | HTMLElement,
                rowClasses:string[] = []) {

    const cell = this.build(workPackageId);
    cell.classList.add(...rowClasses);

    timelineBody.appendChild(cell);
  }
}
