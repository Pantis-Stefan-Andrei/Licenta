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
  CFormSelect 
} from '@coreui/react';
import Swal from 'sweetalert2';
import axios from 'axios';

const Campaine = () => {
  const [pages, setPages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    group: '',
    page: '',
    profile: '',
    email: '',
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
  const [opt, setOption] = useState({
    group: [],
    page: [],
    profile: [],
    email: [],
  });
  useEffect(() => {
    loadPages();
    loadOptions();
   
  }, []);

  const loadPages = async () => {
    try {
      const response = await axios.get('http://localhost:4000/campaine');
      setPages(Array.isArray(response.data) ? response.data : []);
  
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };
  const loadOptions = async () => {
    try {
      const response = await axios.get('http://localhost:4000/option');
      if (response.data) {
        setOption({
          group: response.data.group || [],
          page: response.data.page || [],
          profile: response.data.profile || [],
          email: response.data.email || [],
        });
      }
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };
  const handleSave = async () => {
    try { 
      if (formData.id) {
       
        await axios.put(`http://localhost:4000/campaine/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:4000/campaine', formData);
      }
      setModalVisible(false);
      loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleGenerateAI = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/generate_gemini_campanie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI campanie');
      }

      const data = await response.json();

      // Save the AI-generated campanie as a normal message
      const savedData = {
        name: aiConfig.name,
        senderCampaine: data.expeditor,
        title: data.subiect,
        body: data.body,
      };

      await axios.post('http://localhost:4000/campanie', savedData);
      loadPages();
    } catch (error) {
      console.error('Error generating AI campanie:', error);
      alert('An error occurred while generating the campanie.');
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
      group: '',
      page: '',
      profile: '',
      email: '',
    });
    setModalVisible(true);
  };
  const renderOptions = (data) => {
    return data.map((item, index) => (
      <option key={index} value={item}>
        {item}
      </option>
    ));
  };

  const openPreviewModal = (page) => {
    setPreviewData(page);
    setPreviewModalVisible(true);
  };

  return (
    <CCard>
      <CCardHeader>Campaine Management</CCardHeader>
      <CCardBody>
        <CButton color="primary" onClick={() => openEditModal(null)}>
          <i className="fa fa-plus"></i> New Campaine
        </CButton>
        <CButton color="success" onClick={openAiConfigModal}>
          Configure AI Campaine
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
            {formData.id ? 'Edit Campaine' : 'New Campaine'}
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
    
              <CFormSelect
      value={formData.group}
      onChange={(e) =>
        setFormData({ ...formData, group: e.target.value })
      }
    >
      <option value="" disabled>Select an option for a group</option>
      {renderOptions(opt.group)}
    </CFormSelect>
            <CFormSelect
      value={formData.page}
      onChange={(e) =>
        setFormData({ ...formData, page: e.target.value })
      }
    >
      <option value="" disabled>Select an option for a page</option>
      {renderOptions(opt.page)}
    </CFormSelect>
                 <CFormSelect
      value={formData.profile}
      onChange={(e) =>
        setFormData({ ...formData, profile: e.target.value })
      }
    >
      <option value="" disabled>Select an option for a sending profile</option>
      {renderOptions(opt.profile)}
    </CFormSelect>
    <CFormSelect
      value={formData.email}
      onChange={(e) =>
        setFormData({ ...formData, email: e.target.value })
      }
    >
      <option value="" disabled>Select an option for email</option>
      {renderOptions(opt.email)}
    </CFormSelect>
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
          <CModalHeader>AI Campaine Configuration</CModalHeader>
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
              Generate AI Campaine
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={previewModalVisible} onClose={() => setPreviewModalVisible(false)}>
          <CModalHeader>Preview Campaine</CModalHeader>
          <CModalBody>
            <h5>{previewData.name}</h5>
            <p>{previewData.group}</p>
            <p>{previewData.page}</p>
            <p>{previewData.profile}</p>
            <p>{previewData.email}</p>


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

export default Campaine;