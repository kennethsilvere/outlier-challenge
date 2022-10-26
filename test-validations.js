const studentData = {
  id: 43,
  first_name: 'Ashlee',
  last_name: 'Koepp',
  email: 'Ashlee.Koepp64@yahoo.com',
  is_registered: 0,
  is_approved: 1,
  password_hash: '44a1264db5e181d29232ed455eb99ece3753a93b',
  address: '916 Angela River Suite 584',
  city: 'Gardena',
  state: 'AZ',
  zip: '77840',
  phone: '937-266-0241',
  created: '1628763856945.0',
  last_login: '1628711923544.0',
  ip_address: '65.211.143.187'
}

const studentGradesData = {
  id: 82,
  first_name: 'Mallory',
  last_name: 'Kozey',
  email: 'Mallory67@yahoo.com',
  is_registered: 1,
  is_approved: 1,
  password_hash: 'abc12bf0e808d67e24c846c23b47bcda8aa48e60',
  address: '4656 Arnold Isle Suite 529',
  city: 'Greenville',
  state: 'CO',
  zip: '88904',
  phone: '(318) 810-6863 x998',
  created: '1628785884192.0',
  last_login: '1628716593704.0',
  ip_address: '117.65.36.247'
}

const courseStatistics = {
  Astronomy: {
    highestGrade: 100,
    lowestGrade: 0,
    averageGrade: 50.03889013536759
  },
  Calculus: {
    highestGrade: 100,
    lowestGrade: 0,
    averageGrade: 50.09270747689165
  },
  Microeconomics: {
    highestGrade: 100,
    lowestGrade: 0,
    averageGrade: 49.81138092966023
  },
  Philosophy: {
    highestGrade: 100,
    lowestGrade: 0,
    averageGrade: 50.01606355689488
  },
  Statistics: {
    highestGrade: 100,
    lowestGrade: 0,
    averageGrade: 50.017376820961566
  }
}

function validateAgainstData(testData, data) {
  if (!data || (typeof data !== 'object' && data !== testData)) {
    return false
  }
  if (typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (
        typeof data[key] === 'object' &&
        validateAgainstData(testData[key], data[key]) === false
      ) {
        return false
      } else if (typeof data[key] !== 'object' && data[key] !== testData[key]) {
        return false
      }
    }
  }
  return true
}

function validateAgainstStudentData (data) {
  return validateAgainstData(studentData, data)
}

function validateAgainstStudentGrades (data) {
  return validateAgainstData(studentGradesData, data)
}

function validateAgainstCourseStatistics (data) {
  return validateAgainstData(courseStatistics, data)
}

module.exports = {
  validateAgainstStudentData,
  validateAgainstStudentGrades,
  validateAgainstCourseStatistics
}
