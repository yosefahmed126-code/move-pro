export const APPOINTMENT_STATUS = {
  BOOKED: {
    label: "Booked",
    color: "bg-yellow-100 border-yellow-400",
  },

  CHECKED_IN: {
    label: "Checked In",
    color: "bg-green-100 border-green-500",
  },

  EXCUSED: {
    label: "Excused",
    color: "bg-orange-100 border-orange-500",
  },

  MISSED: {
    label: "Missed",
    color: "bg-gray-200 border-gray-500",
  },

  CANCELLED_BY_MANAGER: {
    label: "Cancelled",
    color: "bg-red-100 border-red-500",
  },
} as const;