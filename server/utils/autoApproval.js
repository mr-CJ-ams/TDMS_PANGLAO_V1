let autoApprovalEnabled = process.env.AUTO_APPROVAL_ENABLED === 'true';

function getAutoApproval() {
  return autoApprovalEnabled;
}

function setAutoApproval(value) {
  autoApprovalEnabled = !!value;
  process.env.AUTO_APPROVAL_ENABLED = value ? 'true' : 'false';
}

module.exports = { getAutoApproval, setAutoApproval }; 