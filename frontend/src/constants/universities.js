// University data structure for scalability
// This file contains all university, faculty, and department information
//
// To add a new university:
// 1. Add a new key with the university name
// 2. Add faculties object with faculty names as keys
// 3. Add departments arrays for each faculty
//
// Example:
// 'New University': {
//   faculties: {
//     'Faculty of Science': ['Computer Science', 'Mathematics'],
//     'Faculty of Arts': ['English', 'History']
//   }
// }

export const UNIVERSITY_DATA = {
  'University of Ilorin': {
    faculties: {
      'Faculty of Agriculture': [
        'Agricultural Economics and Farm Management',
        'Agricultural Extension and Rural Development',
        'Agronomy',
        'Animal Production',
        'Crop Protection',
        'Forestry and wildlife management',
        'Home Economics and Food Science',
        'Soil Science',
        'Aquaculture and Fishery'
      ],
      'Faculty of Arts': [
        'Arabic',
        'English',
        'French',
        'History and International Studies',
        'Linguistics',
        'Performing Arts',
        'Philosophy',
        'Religious Studies',
        'Yoruba'
      ],
      'Faculty of Basic Medical Sciences': [
        'Anatomy',
        'Biochemistry',
        'Medical Laboratory Science',
        'Nursing Science',
        'Physiology'
      ],
      'Faculty of Clinical Sciences': [
        'Behavioural Sciences',
        'Epidemiology and Community Health',
        'Medicine',
        'Obstetrics and Gynaecology',
        'Ophthalmology',
        'Otolaryngology',
        'Paediatrics and Child Health',
        'Pathology',
        'Psychiatry',
        'Radiology',
        'Surgery',
        'Nursing'
      ],
      'Faculty of Communication and Information Sciences': [
        'Computer Science',
        'Information and Communication Science',
        'Library and Information Science',
        'Mass Communication',
        'Telecommunication Science'
      ],
      'Faculty of Education': [
        'Adult and Primary Education',
        'Arts Education',
        'Counsellor Education',
        'Educational Management',
        'Educational Technology',
        'Human Kinetics Education',
        'Health promotion and environmental health education',
        'Science Education',
        'Social Sciences Education',
        'Special Education'
      ],
      'Faculty of Engineering and Technology': [
        'Agricultural and Biosystems Engineering',
        'Biomedical Engineering',
        'Chemical Engineering',
        'Civil Engineering',
        'Computer Engineering',
        'Electrical and Electronics Engineering',
        'Food Engineering',
        'Materials and Metallurgical Engineering',
        'Mechanical Engineering',
        'Water Resources and Environmental Engineering'
      ],
      'Faculty of Environmental Sciences': [
        'Architecture',
        'Estate Management',
        'Quantity Surveying',
        'Surveying and Geoinformatics',
        'Urban and Regional Planning'
      ],
      'Faculty of Law': [
        'Business Law',
        'Islamic Law',
        'Jurisprudence and International Law',
        'Private and Property Law',
        'Public Law'
      ],
      'Faculty of Life Sciences': [
        'Biotechnology',
        'Microbiology',
        'Optometry and Vision Science',
        'Plant Biology',
        'Zoology'
      ],
      'Faculty of Management Sciences': [
        'Accounting',
        'Business Administration',
        'Finance',
        'Industrial Relations and Personnel Management',
        'Marketing',
        'Public Administration'
      ],
      'Faculty of Pharmaceutical Sciences': [
        'Clinical Pharmacy and Pharmacy Practice',
        'Pharmaceutical and Medicinal Chemistry',
        'Pharmaceutical Microbiology and Biotechnology',
        'Pharmaceutics and Industrial Pharmacy',
        'Pharmacognosy and Drug Development',
        'Pharmacology and Toxicology'
      ],
      'Faculty of Physical Sciences': [
        'Chemistry',
        'Computer Science',
        'Geology',
        'Industrial Chemistry',
        'Mathematics',
        'Physics',
        'Statistics'
      ],
      'Faculty of Social Sciences': [
        'Criminology and Security Studies',
        'Economics',
        'Geography and Environmental Management',
        'Political Science',
        'Psychology',
        'Social Work',
        'Sociology'
      ],
      'Faculty of Veterinary Medicine': [
        'Veterinary Anatomy',
        'Veterinary Medicine',
        'Veterinary Microbiology',
        'Veterinary Parasitology and Entomology',
        'Veterinary Pathology',
        'Veterinary Pharmacology and Toxicology',
        'Veterinary Physiology and Biochemistry',
        'Veterinary Public Health and Preventive Medicine',
        'Veterinary Surgery and Radiology'
      ]
    }
  }
  // Future universities can be added here
  // 'Another University': { faculties: { ... } }
};

// Helper functions for working with university data
export const getUniversities = () => Object.keys(UNIVERSITY_DATA);

export const getFaculties = (university) => {
  return university && UNIVERSITY_DATA[university]
    ? Object.keys(UNIVERSITY_DATA[university].faculties)
    : [];
};

export const getDepartments = (university, faculty) => {
  return university && faculty && UNIVERSITY_DATA[university]?.faculties[faculty]
    ? UNIVERSITY_DATA[university].faculties[faculty]
    : [];
};
