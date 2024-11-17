import React, { useEffect, useState } from 'react';
import { 
  CRow, CCol, CCard, CCardHeader, CCardBody, 
  CButton, CModal, CModalHeader, CModalBody, 
  CModalFooter, CForm, CFormInput, CTable, 
  CTableBody, CTableRow, CTableDataCell 
} from '@coreui/react';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import axios from 'axios';

const GroupManager = () => {
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    GroupName: '',
    targets: [],
  });

  const [newTarget, setNewTarget] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    position: ''
  });

  useEffect(() => {
    loadGroups();
  }, []);

  // Load groups from the backend
  const loadGroups = async () => {
    try {
      const response = await axios.get('http://localhost:4000/groups');
      setGroups(response.data);
    } catch (error) {
      console.error("Error loading groups:", error);
      Swal.fire("Error", "Failed to load groups", "error");
    }
  };

  // Function to handle form submission
  const handleModalSubmit = async () => {
    try {
      const groupData = {
        GroupName: [formData.GroupName], // Ensure GroupName is sent as an array
        targets: formData.targets
      };

      if (selectedGroup) {
        // Update group
        await axios.put(`http://localhost:4000/groups/${selectedGroup._id}`, groupData);
        Swal.fire("Success", "Group updated successfully", "success");
      } else {
        // Create new group
        await axios.post('http://localhost:4000/groups', groupData);
        Swal.fire("Success", "Group added successfully", "success");
      }
      setModalVisible(false);
      loadGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      Swal.fire("Error", "Failed to save group", "error");
    }
  };

  // Function to open the modal for adding a new group
  const openAddModal = () => {
    setSelectedGroup(null);
    setFormData({
      GroupName: '',
      targets: [],
    });
    setModalVisible(true);
  };

  // Function to open the modal for editing a group
  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      GroupName: group.GroupName,
      targets: group.targets || [],
    });
    setModalVisible(true);
  };

  // Function to handle group deletion
  const handleDeleteGroup = async (groupId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the group. This can't be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:4000/groups/${groupId}`);
          loadGroups();
        } catch (error) {
          console.error("Error deleting group:", error);
          Swal.fire("Error", "Failed to delete group", "error");
        }
      }
    });
  };

  // Function to add individual target
  const insertNewData = async () => {
    try {
      const targetData = {
        ...newTarget,
        GroupName: [formData.GroupName] // GroupName as an array of strings
      };
      await axios.post('http://localhost:4000/groups_add', targetData);
      loadGroups();
    } catch (error) {
      console.error("Error saving target:", error);
      Swal.fire("Error", "Failed to save target", "error");
    }
  };

  // Function to handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && /csv|txt$/i.test(file.name.split('.').pop())) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsedTargets = results.data.map(target => ({
            firstName: target['First Name'],
            lastName: target['Last Name'],
            emailAddress: target['Email'],
            position: target['Position']
          }));
          setFormData(prev => ({ ...prev, targets: [...prev.targets, ...parsedTargets] }));
        }
      });
    } else {
      Swal.fire("Error", "Unsupported file extension (use .csv or .txt)", "error");
    }
  };

  // Function to add individual target to the form data
  const handleAddIndividualTarget = () => {
    if (newTarget.firstName && newTarget.lastName && newTarget.emailAddress && newTarget.position) {
      setFormData(prev => ({
        ...prev,
        targets: [...prev.targets, newTarget]
      }));
      insertNewData();
      setNewTarget({ firstName: '', lastName: '', emailAddress: '', position: '' });
    } else {
      Swal.fire("Error", "Please fill out all fields for the new target", "error");
    }
  };

  // Function to download a CSV template
  const downloadCSVTemplate = () => {
    const template = [{ "First Name": "Example", "Last Name": "User", "Email": "foobar@example.com", "Position": "Systems Administrator" }];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "group_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        Group Manager
        <CButton color="primary" onClick={openAddModal} style={{ float: 'right' }}>
          Add Group
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CTable hover responsive>
            <CTableBody>
              {groups.map(group => (
                <CTableRow key={group._id}>
                  <CTableDataCell>{group.GroupName}</CTableDataCell>
                  <CTableDataCell>{group.targets?.length || 0}</CTableDataCell>
                  <CTableDataCell>{new Date(group.modified_date).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" onClick={() => openEditModal(group)}>Edit</CButton>
                    <CButton color="danger" onClick={() => handleDeleteGroup(group._id)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CRow>

        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>{selectedGroup ? 'Edit Group' : 'New Group'}</CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput 
                type="text" 
                value={formData.GroupName} 
                onChange={(e) => setFormData({ ...formData, GroupName: e.target.value })} 
                placeholder="Group Name" 
              />
              <h5>Add Individual Target</h5>
              <CFormInput 
                type="text" 
                placeholder="First Name" 
                value={newTarget.firstName} 
                onChange={(e) => setNewTarget({ ...newTarget, firstName: e.target.value })} 
              />
              <CFormInput 
                type="text" 
                placeholder="Last Name" 
                value={newTarget.lastName} 
                onChange={(e) => setNewTarget({ ...newTarget, lastName: e.target.value })} 
              />
              <CFormInput 
                type="email" 
                placeholder="Email Address" 
                value={newTarget.emailAddress} 
                onChange={(e) => setNewTarget({ ...newTarget, emailAddress: e.target.value })} 
              />
              <CFormInput 
                type="text" 
                placeholder="Position" 
                value={newTarget.position} 
                onChange={(e) => setNewTarget({ ...newTarget, position: e.target.value })} 
              />
              <CButton color="success" onClick={handleAddIndividualTarget}>Add Target</CButton>

              <h5>Or Upload CSV of Targets</h5>
              <CFormInput type="file" onChange={handleFileUpload} placeholder="Upload CSV of Targets" />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
            <CButton color="primary" onClick={handleModalSubmit}>{selectedGroup ? 'Save Changes' : 'Add Group'}</CButton>
          </CModalFooter>
        </CModal>

        <CButton color="link" onClick={downloadCSVTemplate}>Download CSV Template</CButton>
      </CCardBody>
    </CCard>
  );
};

export default GroupManager;
