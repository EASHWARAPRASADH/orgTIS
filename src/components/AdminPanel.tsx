import React, { useState, useEffect } from "react";
import { Employee } from "../types";
import { DEPARTMENTS } from "../constants";
import { Plus, Trash2, Edit2, X, Check, UserPlus, Users, GripVertical, Camera, Upload, Search, ChevronDown, ChevronRight, Filter, Mail, Phone, Calendar, Database } from "lucide-react";
import { cn } from "../lib/utils";
import { Reorder, useDragControls } from "motion/react";

interface AdminPanelProps {
  employees: Employee[];
  onAdd: (employee: Employee) => void;
  onUpdate: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onReorder: (newEmployees: Employee[]) => void;
  onSyncAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  employees,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  onSyncAll,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    role: "",
    department: DEPARTMENTS[0].name,
    managerId: null,
    photoUrl: "https://picsum.photos/seed/new/100/100",
    contact: "",
    email: "",
    joinDate: new Date().toISOString().split('T')[0],
  });

  // Sort employees by displayOrder for the list
  const sortedEmployees: Employee[] = [...employees].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: formData.name || "New Employee",
      role: formData.role || "Role",
      department: formData.department || DEPARTMENTS[0].name,
      photoUrl: formData.photoUrl || `https://picsum.photos/seed/${formData.name}/100/100`,
      managerId: formData.managerId || null,
      color: DEPARTMENTS.find(d => d.name === formData.department)?.color || "#E5E7EB",
      displayOrder: editingId ? (formData.displayOrder || 0) : employees.length,
      contact: formData.contact,
      email: formData.email,
      joinDate: formData.joinDate,
      bio: formData.bio,
    };

    if (editingId) {
      onUpdate(employee);
      setEditingId(null);
    } else {
      onAdd(employee);
      setIsAdding(false);
    }
    setFormData({
      name: "",
      role: "",
      department: DEPARTMENTS[0].name,
      managerId: null,
      photoUrl: "https://picsum.photos/seed/new/100/100",
      contact: "",
      email: "",
      joinDate: new Date().toISOString().split('T')[0],
      bio: "",
    });
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData(emp);
    setIsAdding(true);
  };

  const handleReorder = (newOrder: Employee[]) => {
    const updated = newOrder.map((emp, index) => ({
      ...emp,
      displayOrder: index
    }));
    onReorder(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDept = (dept: string) => {
    const next = new Set(collapsedDepts);
    if (next.has(dept)) next.delete(dept);
    else next.add(dept);
    setCollapsedDepts(next);
  };

  // Filter and group employees
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    emp.role.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    emp.department.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  const groupedEmployees = DEPARTMENTS.map(dept => ({
    ...dept,
    members: filteredEmployees
      .filter(emp => emp.department === dept.name)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  })).filter(group => group.members.length > 0 || rosterSearch === "");

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-96 shadow-xl">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Manage Team</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSyncAll}
            title="Sync live database with constants"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <Database className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              setFormData({
                name: "",
                role: "",
                department: DEPARTMENTS[0].name,
                managerId: null,
                photoUrl: "https://picsum.photos/seed/new/100/100",
                contact: "",
                email: "",
                joinDate: new Date().toISOString().split('T')[0],
                bio: "",
              });
            }}
            className={cn(
              "p-2 rounded-full transition-all",
              isAdding ? "bg-red-50 text-red-600 rotate-45" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                {editingId ? "Edit Employee" : "New Employee"}
              </h3>
              <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reports To</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={formData.managerId || ""}
                    onChange={e => setFormData({ ...formData, managerId: e.target.value || null })}
                  >
                    <option value="">None (Top Level)</option>
                    {employees
                      .filter(e => e.id !== editingId)
                      .map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Details Section */}
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@company.com"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={formData.email || ""}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact</label>
                    <input
                      type="tel"
                      placeholder="+1 234 567 890"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={formData.contact || ""}
                      onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Join Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={formData.joinDate || ""}
                    onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Quote</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    placeholder="Enter a short bio or quote..."
                    value={formData.bio || ""}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-20 h-20">
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                      <div className="flex flex-col items-center justify-center pt-1">
                        <Upload className="w-4 h-4 text-gray-400 mb-1" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Upload Photo</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 font-medium">Recommended: Square image, max 800KB</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? "Update Employee" : "Add to Team"}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Roster</h3>
          </div>

          {/* Roster Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search roster..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
            />
          </div>
          
          <div className="space-y-4">
            {groupedEmployees.map(group => (
              <div key={group.name} className="space-y-2">
                <button 
                  onClick={() => toggleDept(group.name)}
                  className="flex items-center justify-between w-full px-2 py-1 hover:bg-gray-50 rounded transition-colors group/dept"
                >
                  <div className="flex items-center gap-2">
                    {collapsedDepts.has(group.name) ? <ChevronRight className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{group.name}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold rounded-full">{group.members.length}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                </button>

                {!collapsedDepts.has(group.name) && (
                  <Reorder.Group 
                    axis="y" 
                    values={group.members} 
                    onReorder={(newOrder) => {
                      // Find the start index for this group in the global displayOrder
                      const otherMembers = employees.filter(e => e.department !== group.name);
                      const updated = [...otherMembers, ...newOrder.map((emp, i) => ({ ...emp, displayOrder: i }))];
                      onReorder(updated);
                    }} 
                    className="space-y-2 pl-2 border-l border-gray-100 ml-3"
                  >
                    {group.members.map(emp => (
                      <RosterItem 
                        key={emp.id} 
                        emp={emp} 
                        employees={employees}
                        onEdit={handleEdit} 
                        onDelete={onDelete} 
                      />
                    ))}
                  </Reorder.Group>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface RosterItemProps {
  emp: Employee;
  employees: Employee[];
  onEdit: (emp: Employee) => void;
  onDelete: (id: string) => void;
}

const RosterItem: React.FC<RosterItemProps> = ({ emp, employees, onEdit, onDelete }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={emp}
      dragControls={controls}
      dragListener={false}
      className="group flex items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
    >
      <div 
        className="mr-2 cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 transition-colors"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <img
        src={emp.photoUrl}
        alt={emp.name}
        className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-gray-50 shadow-sm"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">{emp.name}</h4>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-gray-500 truncate">{emp.role}</p>
            {emp.managerId && (
              <>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[10px] text-blue-500 font-medium truncate">
                  Reports to {employees.find(e => e.id === emp.managerId)?.name || 'Unknown'}
                </span>
              </>
            )}
          </div>
          {(emp.email || emp.contact || emp.bio) && (
            <div className="flex flex-col gap-1 mt-1">
              {(emp.email || emp.contact) && (
                <div className="flex items-center gap-3">
                  {emp.email && (
                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                      <Mail className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[80px]">{emp.email}</span>
                    </div>
                  )}
                  {emp.contact && (
                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                      <Phone className="w-2.5 h-2.5" />
                      <span>{emp.contact}</span>
                    </div>
                  )}
                </div>
              )}
              {emp.bio && (
                <p className="text-[9px] text-gray-400 italic line-clamp-1">
                  "{emp.bio}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(emp)}
          title="Edit Employee"
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(emp.id)}
          title="Delete Employee"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}
