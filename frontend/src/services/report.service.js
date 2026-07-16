import api from './api';

const API_URL = '/reports';

const exportFinancialReport = async (startDate, endDate) => {
  // We need to handle blob response for file download
  const response = await api.get(`${API_URL}/export?startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob', // Important for downloading files
  });
  
  // Create a URL and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `financial_report_${startDate}_to_${endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const reportService = {
  exportFinancialReport
};

export default reportService;
