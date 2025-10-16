const Form = (props) =>{
    return(
        <>
            <div className="form-container flex justify-center items-center h-full">
                <div className={props.className1}>
                    <div className="bg-white rounded-lg shadow-xl text-black">
                        <div className="flex flex-wrap">
                            <div className={props.className2}>
                                <div className="p-8 md:p-12">

                                    <div className="text-center">
                                        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                                            className="w-48 mx-auto" alt="logo" />
                                        {props.title}
                                    </div>

                                    <form
                                        method={props.method}
                                        onSubmit={props.onSubmit}
                                        action={props.action}
                                    >
                                        {props.signinOptions}

                                        {props.inputFields}

                                        {props.buttonOptions}
                                    </form>

                                </div>
                            </div>
                            {props.extraContent}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Form