import api from './api';

const API_URL = '/reports';

const exportFinancialReport = async (startDate, endDate) => {
  try {
    const res = await api.get(`${API_URL}/export?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob',
    });

    // Check if the response is JSON error returned as blob
    if (res.data.type === 'application/json') {
      const text = await res.data.text();
      const json = JSON.parse(text);
      throw new Error(json.message || json.msg || 'Failed to generate report');
    }

    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || json.msg || 'Failed to generate report');
      } catch (parseErr) {
        throw new Error(error.message || 'Failed to generate report');
      }
    }
    throw error;
  }
};

const reportService = {
  exportFinancialReport,
};

export default reportService;
