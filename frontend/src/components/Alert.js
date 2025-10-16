const Alert = (props) => {
    return (
        <>
            <div className={props.className} role="alert">
                <div className="container mx-auto">
                <div className="flex">
                    <div className="py-1">
                        <svg className="fill-current h-6 w-6 text-teal-500 mr-4">{props.icon}</svg>
                    </div>
                    <div>
                        <p className="font-bold">Notification</p>
                        <p className="text-sm">{props.message}</p>
                    </div>
                </div>
                </div>
            </div>
        </>
    )
}
export default Alert;