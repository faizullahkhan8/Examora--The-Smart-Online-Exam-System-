/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param headers Optional custom headers mapping { [key in keyof T]: string }
 */
export const exportToCSV = <T extends Record<string, any>>(
    data: T[],
    filename: string,
    headers?: Partial<Record<keyof T, string>>,
) => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // 1. Determine keys to include
    const keys = Object.keys(data[0]) as (keyof T)[];

    // 2. Create Header Row
    const headerRow = keys
        .map((key) => {
            const label = headers?.[key] || String(key);
            return `"${label.replace(/"/g, '""')}"`;
        })
        .join(",");

    // 3. Create Data Rows
    const dataRows = data.map((item) => {
        return keys
            .map((key) => {
                const rawVal = item[key];
                let val: string;

                // Handle complex types
                if (rawVal === null || rawVal === undefined) {
                    val = "";
                } else if (typeof rawVal === "object") {
                    // Try to get name property if it exists (for Institute/Department)
                    val = (rawVal as any).name || JSON.stringify(rawVal);
                } else {
                    val = String(rawVal);
                }

                // Format strings for CSV
                const stringVal = val.replace(/"/g, '""');
                return `"${stringVal}"`;
            })
            .join(",");
    });

    // 4. Combine and Download
    const csvContent = [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
