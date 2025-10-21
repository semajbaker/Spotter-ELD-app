import * as fa from 'react-icons/fa';

const Form = (props) => {
    return (
        <>
            <div className="form-container flex justify-center items-center h-full p-4 sm:p-6 md:p-8">
                <div className={`relative w-full max-w-4xl ${props.className1}`}>
                    {/* Close Button */}
                    {props.onClose && (
                        <button
                            onClick={props.onClose}
                            className="m-4 p-2 absolute -top-2 -right-2 sm:top-2 sm:right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
                            aria-label="Close form"
                        >
                            <fa.FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    )}
                    
                    <div className="bg-white rounded-lg shadow-xl text-black max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-wrap">
                            <div className={props.className2}>
                                <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                                    <div className="text-center">
                                        <img 
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                                            className="w-32 sm:w-40 md:w-48 mx-auto" 
                                            alt="logo" 
                                        />
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
    );
};

export default Form;