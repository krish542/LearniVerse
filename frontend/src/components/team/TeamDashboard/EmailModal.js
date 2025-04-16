const [emailModalOpen, setEmailModalOpen] = useState(false);
const [recipientEmail, setRecipientEmail] = useState('');

const openEmailModal = (email) => {
  setRecipientEmail(email);
  setEmailModalOpen(true);
};