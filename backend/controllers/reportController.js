const db = require('../db/initDb');

const getReportSummary = async (req, res) => {
  try {
    const { type, startDate, endDate, status } = req.query; // type: 'meals', 'volunteers', 'assistance', 'needs'
    let data = [];
    let tableName = 'meal_requests';

    if (type === 'volunteers') tableName = 'volunteer_registrations';
    else if (type === 'assistance') tableName = 'assistance_requests';
    else if (type === 'needs') tableName = 'needs';

    let sql = `SELECT * FROM ${tableName} WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (startDate && tableName !== 'needs') {
      sql += ` AND created_at >= ?`;
      params.push(startDate);
    }
    if (endDate && tableName !== 'needs') {
      sql += ` AND created_at <= ?`;
      params.push(endDate + ' 23:59:59');
    }

    sql += ` ORDER BY created_at DESC`;

    data = await db.query(sql, params);

    res.json({
      success: true,
      reportType: type || 'meals',
      totalRecords: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReportSummary };
