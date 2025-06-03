const express = require('express');
const partnerController = require('../controllers/partner_controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth_middleware');
const handleValidationErrors = require('../middlewares/validation_middleware');
const { param } = require('express-validator');

const router = express.Router();

router.use(authenticateToken, isAdmin); // Yêu cầu admin cho tất cả các route đối tác

router.post('/',
    partnerController.createPartnerValidationRules(),
    handleValidationErrors,
    partnerController.createPartner
);

router.get('/',
    partnerController.getAllPartnersQueryValidationRules(),
    handleValidationErrors,
    partnerController.getAllPartners
);

router.get('/:id_doi_tac',
    [param('id_doi_tac').isInt({ min: 1 }).withMessage('ID đối tác không hợp lệ.')],
    handleValidationErrors,
    partnerController.getPartnerById
);

router.put('/:id_doi_tac',
    partnerController.updatePartnerValidationRules(),
    handleValidationErrors,
    partnerController.updatePartner
);

router.delete('/:id_doi_tac',
    [param('id_doi_tac').isInt({ min: 1 }).withMessage('ID đối tác không hợp lệ.')],
    handleValidationErrors,
    partnerController.deletePartner
);

module.exports = router;