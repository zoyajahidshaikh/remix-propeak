import { serviceHost } from '../../common/const';
import ServiceRequest from '../../utils/service-request';

export const getUserPerformanceReportData = async (filterData) => {
    try {
        let data = {
            userId:filterData.userId,
            projectId: filterData.projectId,
            year: filterData.year,
            month: filterData.month,
            dateFrom: filterData.dateFrom,
            dateTo: filterData.dateTo

        }

        let response = await ServiceRequest('post', 'json', serviceHost + '/reports/getUserPerformanceReport', data);
        return { response, err: null };
    }
    catch (err) {
        if (err) {
            return { response: null, err };
        }
    }
}