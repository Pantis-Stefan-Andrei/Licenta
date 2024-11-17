import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import Swal from 'sweetalert2';
import axios from 'axios';

const Email = () => {
  const [pages, setPages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    senderEmail: '',
    title: '',
    body: '',
  });
  const [aiConfig, setAiConfig] = useState({
    name: '',
    expeditor: '',
    destinatar: '',
    subiect: '',
    tip: '',
    emoji: false,
    lungime: '',
    url: '',
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await axios.get('http://localhost:4000/email');
      setPages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };
  const handleDeletePage = async (pageId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the landing page. This can't be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:4000/email/${pageId._id}`);
          loadPages();
        } catch (error) {
          console.error("Error deleting page:", error);
        }
      }
    });
  };
  const handleSave = async () => {
    try {
      if (formData.id) {
        await axios.put(`http://localhost:4000/email/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:4000/email', formData);
      }
      setModalVisible(false);
      loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleGenerateAI = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/generate_gemini_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI email');
      }

      const data = await response.json();

      // Save the AI-generated email as a normal message
      const savedData = {
        name: aiConfig.name,
        senderEmail: data.expeditor,
        title: data.subiect,
        body: data.body,
      };

      await axios.post('http://localhost:4000/email', savedData);
      loadPages();
    } catch (error) {
      console.error('Error generating AI email:', error);
      alert('An error occurred while generating the email.');
    }
  };

  const openAiConfigModal = () => {
    setAiModalVisible(true);
  };

  const handleSaveAiConfig = () => {
    setAiModalVisible(false);
    handleGenerateAI();
  };

  const openEditModal = (page) => {
    setFormData(page || {
      name: '',
      senderEmail: '',
      title: '',
      body: '',
    });
    setModalVisible(true);
  };

  const openPreviewModal = (page) => {
    setPreviewData(page);
    setPreviewModalVisible(true);
  };

  return (
    <CCard>
      <CCardHeader>Email Management</CCardHeader>
      <CCardBody>
        <CButton color="primary" onClick={() => openEditModal(null)}>
          <i className="fa fa-plus"></i> New Email
        </CButton>
        <CButton color="success" onClick={openAiConfigModal}>
          Configure AI Email
        </CButton>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Last Modified Date</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {Array.isArray(pages) &&
              pages.map((page) => (
                <CTableRow key={page._id}>
                  <CTableDataCell>{page.name}</CTableDataCell>
                  <CTableDataCell>
                    {new Date(page.modified_date).toLocaleString()}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      onClick={() => openEditModal(page)}
                    >
                      Edit
                    </CButton>{' '}
                    <CButton
                      color="danger"
                      onClick={() => handleDeletePage(page)}
                    >
                      Delete
                    </CButton>{' '}
                    <CButton
                      color="primary"
                      onClick={() => openPreviewModal(page)}
                    >
                      Preview
                    </CButton>{' '}
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
        </CTable>

        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            {formData.id ? 'Edit Email' : 'New Email'}
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Sender Email"
                value={formData.senderEmail}
                onChange={(e) =>
                  setFormData({ ...formData, senderEmail: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Subject"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setModalVisible(false)}
            >
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSave}>
              Save
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={aiModalVisible} onClose={() => setAiModalVisible(false)}>
          <CModalHeader>AI Email Configuration</CModalHeader>
          <CModalBody>
            <CForm>
            <CFormInput
                type="text"
                placeholder="Name"
                value={aiConfig.name}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, name: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Sender"
                value={aiConfig.expeditor}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, expeditor: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Recipient"
                value={aiConfig.destinatar}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, destinatar: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Subject"
                value={aiConfig.subiect}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, subiect: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Type"
                value={aiConfig.tip}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, tip: e.target.value })
                }
              />
              <CFormInput
                type="text"
                placeholder="Length"
                value={aiConfig.lungime}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, lungime: e.target.value })
                }
              />
               <CFormInput
                type="text"
                placeholder="Url"
                value={aiConfig.url}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, url: e.target.value })
                }
              />
              <label>
                Use Emoji:
                <input
                  type="checkbox"
                  checked={aiConfig.emoji}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, emoji: e.target.checked })
                  }
                />
              </label>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setAiModalVisible(false)}
            >
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSaveAiConfig}>
              Generate AI Email
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={previewModalVisible} onClose={() => setPreviewModalVisible(false)}>
          <CModalHeader>Preview Email</CModalHeader>
          <CModalBody>
            <h5>{previewData.title}</h5>
            <p><strong>From:</strong> {previewData.senderEmail}</p>
            <p>{previewData.body}</p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setPreviewModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default Email;