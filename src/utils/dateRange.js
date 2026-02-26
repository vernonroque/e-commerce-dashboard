import moment from "moment";

export function getDateRange(type) {
    let startDate, endDate;
    console.log("The date type passed in is >>>", type);

    switch (type) {
    case "today":
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
        break;

    case "yesterday":
        startDate = moment().subtract(1, "day").startOf("day");
        endDate = moment().subtract(1, "day").endOf("day");
        break;

    case "last_7_days":
        startDate = moment().subtract(7, "days").startOf("day");
        endDate = moment().endOf("day");
        break;

    case "last_30_days":
        startDate = moment().subtract(30, "days").startOf("day");
        endDate = moment().endOf("day");
        break;

    case "this_month":
        startDate = moment().startOf("month");
        endDate = moment().endOf("day");
        break;

    case "last_month":
        startDate = moment().subtract(1, "month").startOf("month");
        endDate = moment().subtract(1, "month").endOf("month");
        break;

    default:
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
    }

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    };
}
