import moment from 'moment';

import { FeatureId } from '@/react/portainer/feature-flags/enums';

export default class AuthLogsViewController {
  /* @ngInject */
  constructor($async, Notifications, UserActivityService) {
    this.$async = $async;
    this.Notifications = Notifications;
    this.UserActivityService = UserActivityService;

    this.limitedFeature = FeatureId.ACTIVITY_AUDIT;
    this.state = {
      keyword: '',
      date: {
        from: 0,
        to: 0,
      },
      sort: {
        key: 'Timestamp',
        desc: true,
      },
      contextFilter: [1, 2, 3],
      typeFilter: [1, 2, 3],
      page: 1,
      limit: 10,
      totalItems: 0,
      logs: null,
    };

    this.today = moment().endOf('day');
    this.minValidDate = moment().subtract(7, 'd').startOf('day');

    this.onChangeDate = this.onChangeDate.bind(this);
    this.onChangeKeyword = this.onChangeKeyword.bind(this);
    this.onChangeSort = this.onChangeSort.bind(this);
    this.onChangeContextFilter = this.onChangeContextFilter.bind(this);
    this.onChangeTypeFilter = this.onChangeTypeFilter.bind(this);
    this.loadLogs = this.loadLogs.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.onChangeLimit = this.onChangeLimit.bind(this);
  }

  onChangePage(page) {
    this.state.page = page;
    this.loadLogs();
  }

  onChangeLimit(limit) {
    this.state.page = 1;
    this.state.limit = limit;
    this.loadLogs();
  }

  onChangeSort(sort) {
    this.state.page = 1;
    this.state.sort = sort;
    this.loadLogs();
  }

  onChangeContextFilter(filterKey, filterState) {
    this.state.contextFilter = filterState;
    this.loadLogs();
  }

  onChangeTypeFilter(filterKey, filterState) {
    this.state.typeFilter = filterState;
    this.loadLogs();
  }

  onChangeKeyword(keyword) {
    return this.$scope.$evalAsync(() => {
      this.state.page = 1;
      this.state.keyword = keyword;
      this.loadLogs();
    });
  }

  onChangeDate({ startDate, endDate }) {
    this.state.page = 1;
    this.state.date = { to: endDate, from: startDate };
    this.loadLogs();
  }

  async loadLogs() {
    return this.$async(async () => {
      this.state.logs = null;
      try {
        const params = {
          offset: (this.state.page - 1) * this.state.limit,
          limit: this.state.limit,
          keyword: this.state.keyword,
          date: {
            from: this.state.date.from,
            to: this.state.date.to,
          },
          sort: this.state.sort,
          contexts: this.state.contextFilter,
          types: this.state.typeFilter,
        };

        const { logs, totalCount } = await this.UserActivityService.authLogs(params.offset, params.limit, params.sort, params.keyword, params.date, params.contexts, params.types);
        this.state.logs = decorateLogs(logs);
        this.state.totalItems = totalCount;
      } catch (err) {
        this.Notifications.error('Failure', err, 'Failed loading auth activity logs');
      }
    });
  }

  $onInit() {
    return this.$async(async () => {
      this.loadLogs();
    });
  }
}

function decorateLogs(logs) {
  return logs;
}
