import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useExcelExport } from '@/composables/useExcelExport';
import { i18n } from '@/main'; // 导入axios

export default {
  props: ['data'],
  methods: {
    exportCSV() {
      
      axios.get(`/api/expenses/csv?timestamp=${Date.now()}`) // 添加时间戳避免缓存
        .then(response => {
          const csvPath = response.data.path;
          // 假设后端静态资源服务已配置，直接访问文件路径下载
          const downloadUrl = `${window.location.origin}/${csvPath}`; // 使用后端返回的动态CSV路径下载
          saveAs(downloadUrl, 'expenses.csv');
        })
        .catch(error => {
          console.error('导出CSV失败:', error);
        });
    },
    exportExcel() {
      const { exportToExcel } = useExcelExport();
      exportToExcel(this.data, i18n.global.t('expense.exportFilename'));
    }
  },
  render() {
    return (
      <div class="export-buttons">
        <button onClick={this.exportCSV}>导出CSV</button>
        <button onClick={this.exportExcel}>导出Excel</button>
      </div>
    )
  }
}