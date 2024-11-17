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

const LandingPages = () => {
  const [pages, setPages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    html: '',
    capture_credentials: false,
    capture_passwords: false,
    redirect_url: '',
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await axios.get('http://localhost:4000/page');
      console.log(response.data); // Debugging: Check the structure of the response

      // Ensure the response is an array before setting it in state
      setPages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading pages:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        // Update existing page
        await axios.put(`http://localhost:4000/page/${formData.id}`, formData);
      } else {
        // Add new page
        await axios.post('http://localhost:4000/page_add', formData);
      }
      setModalVisible(false);
      loadPages();
    } catch (error) {
      console.error("Error saving page:", error);
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
          await axios.delete(`http://localhost:4000/page/${pageId._id}`);
          loadPages();
        } catch (error) {
          console.error("Error deleting page:", error);
        }
      }
    });
  };

  const handleStartHost = async (pageId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will start the landing page!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Host IT',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = { url: pageId.html }; // Adjust the key name to 'url' or the correct key
          console.log("Data to send:", data); 
        await axios.post(`http://127.0.0.1:5004/clone`, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
          loadPages();
        } catch (error) {
          console.error("Error deleting page:", error);
        }
      }
    });
  };


  const openEditModal = (page) => {
    setFormData(page || {
      name: '',
      html: '',
      capture_credentials: false,
      capture_passwords: false,
      redirect_url: '',
    });
    setModalVisible(true);
  };

  return (
    <CCard>
      <CCardHeader>Landing Pages</CCardHeader>
      <CCardBody>
        <CButton color="primary" onClick={() => openEditModal(null)}>
          <i className="fa fa-plus"></i> New Page
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
            {Array.isArray(pages) && pages.map((page) => (
              <CTableRow key={page._id}>
                <CTableDataCell>{page.name}</CTableDataCell>
                <CTableDataCell>
                  {new Date(page.modified_date).toLocaleString()}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" onClick={() => openEditModal(page)}>
                    Edit
                  </CButton>{' '}
                  <CButton color="danger" onClick={() => handleDeletePage(page)}>
                    Delete
                  </CButton>{' '}
                  <CButton color="info" onClick={() => handleStartHost(page)}>
                    Start Host
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Modal for adding/editing pages */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>{formData.id ? 'Edit Page' : 'New Page'}</CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                placeholder="Page name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
               <CFormInput
                type="text"
                placeholder="Url link"
                value={formData.html}
                onChange={(e) =>
                  setFormData({ ...formData, html: e.target.value })
                }
              />
              {/* CKEditor Integration can go here */}
              <div className="checkbox">
                <input
                  type="checkbox"
                  checked={formData.capture_credentials}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capture_credentials: e.target.checked,
                    })
                  }
                />
                <label>Capture Submitted Data</label>
              </div>
              {formData.capture_credentials && (
                <>
                  <div className="checkbox">
                    <input
                      type="checkbox"
                      checked={formData.capture_passwords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capture_passwords: e.target.checked,
                        })
                      }
                    />
                    <label>Capture Passwords</label>
                  </div>
                  <CFormInput
                    type="text"
                    placeholder="http://example.com"
                    value={formData.redirect_url}
                    onChange={(e) =>
                      setFormData({ ...formData, redirect_url: e.target.value })
                    }
                  />
                  
                </>
              )}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSave}>
              Save Page
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default LandingPages;
