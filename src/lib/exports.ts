/**
 * Data Export Module
 * 
 * Provides functions to export application data in CSV and Excel formats:
 * - Student data export
 * - Class enrollment export
 * - Graduate records export
 * 
 * Features:
 * - Automatic row numbering
 * - Readable date formatting
 * - Clean column headers
 * - Auto-sized columns in Excel
 * 
 * @module exports
 * @version 1.0.0
 */

import { User, Class, Enrollment } from '@/types';
import * as XLSX from 'xlsx';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportToXLSX = (data: any[], filename: string, sheetName: string = 'Data') => {
  if (data.length === 0) return;
  
  // Add row numbers to data
  const dataWithNumbers = data.map((row, index) => ({
    '#': index + 1,
    ...row
  }));
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(dataWithNumbers);
  
  // Auto-size columns
  const maxWidth = 50;
  const cols = Object.keys(dataWithNumbers[0]).map(key => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...dataWithNumbers.map(row => String(row[key] || '').length)
      ),
      maxWidth
    )
  }));
  worksheet['!cols'] = cols;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Write file
  XLSX.writeFile(workbook, filename);
};

// Helper function to format dates nicely
const formatDateReadable = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const exportData = (data: any[], filename: string, format: 'csv' | 'xlsx' = 'csv', sheetName?: string) => {
  if (format === 'xlsx') {
    exportToXLSX(data, filename, sheetName);
  } else {
    exportToCSV(data, filename);
  }
};

export const exportStudents = (users: User[], format: 'csv' | 'xlsx' = 'csv') => {
  const students = users
    .filter(u => u.role === 'student')
    .map(({ id, password, registeredAt, ...rest }) => ({
      ...rest,
      'Registered': formatDateReadable(registeredAt),
    }));
  
  const filename = format === 'xlsx' ? 'all-students.xlsx' : 'all-students.csv';
  exportData(students, filename, format, 'Students');
};

export const exportClassStudents = (classItem: Class, enrollments: Enrollment[], users: User[], format: 'csv' | 'xlsx' = 'csv') => {
  const classEnrollments = enrollments.filter(e => e.classId === classItem.id);
  const students = classEnrollments.map(e => {
    const user = users.find(u => u.id === e.studentId);
    return {
      'Name': user?.name,
      'Email': user?.email,
      'Church': user?.church || 'N/A',
      'Fellowship': user?.fellowship || 'N/A',
      'Cell': user?.cell || 'N/A',
      'Enrolled': formatDateReadable(e.enrolledAt),
      'Completed': e.completed ? 'Yes' : 'No',
      'Graduated': e.graduated ? 'Yes' : 'No',
    };
  });
  
  const sanitizedName = classItem.name.replace(/[^a-z0-9]/gi, '-');
  const filename = format === 'xlsx' ? `class-${sanitizedName}-students.xlsx` : `class-${sanitizedName}-students.csv`;
  const sheetName = classItem.name.length > 31 ? classItem.name.substring(0, 31) : classItem.name;
  exportData(students, filename, format, sheetName);
};

export const exportGraduates = (enrollments: Enrollment[], users: User[], format: 'csv' | 'xlsx' = 'csv') => {
  const graduates = enrollments.filter(e => e.graduated).map(e => {
    const user = users.find(u => u.id === e.studentId);
    return {
      'Name': user?.name,
      'Email': user?.email,
      'Church': user?.church || 'N/A',
      'Fellowship': user?.fellowship || 'N/A',
      'Enrolled': formatDateReadable(e.enrolledAt),
    };
  });
  
  const filename = format === 'xlsx' ? 'graduates.xlsx' : 'graduates.csv';
  exportData(graduates, filename, format, 'Graduates');
};
