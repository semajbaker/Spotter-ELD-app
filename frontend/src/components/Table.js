const Table = (props) => {
    return (
        <div className="relative mb-8 overflow-hidden">
            {/* Title Section with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-t-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-white rounded-full"></div>
                    {props.title}
                </h2>
                {props.subtitle && (
                    <p className="text-blue-100 dark:text-blue-200 mt-2 text-sm">
                        {props.subtitle}
                    </p>
                )}
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b-2 border-blue-500 dark:border-blue-600">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input 
                                            id={`checkbox-all-${props.title}`}
                                            type="checkbox" 
                                            onChange={props.onSelectAll}
                                            checked={props.allSelected}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all hover:scale-110" 
                                        />
                                        <label htmlFor={`checkbox-all-${props.title}`} className="sr-only">Select all</label>
                                    </div>
                                </th>
                                {props.columns}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {props.rows && props.rows.length > 0 ? (
                                props.rows
                            ) : (
                                <tr>
                                    <td colSpan="100%" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-lg font-medium">No data available</p>
                                            <p className="text-sm mt-1">There are no records to display at this time.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer with Stats */}
                {props.rows && props.rows.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {props.rows.length}
                                </span>
                                <span>total records</span>
                            </div>
                            {props.selectedCount > 0 && (
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>{props.selectedCount} selected</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Table;