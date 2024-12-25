const { createLead } = require('../services/zohoService');

const processLeadCreation = async (req, res) => {
    const payload = req.body.payload;
    await createLead(payload, res);
};

module.exports = {
    processLeadCreation
};