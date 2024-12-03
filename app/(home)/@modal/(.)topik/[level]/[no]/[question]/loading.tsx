const Loading = () => {
	return (
		<div className="fixed top-0 left-0 w-full h-full z-10 flex items-center justify-center">
			<div className="modal-box items-center justify-center flex min-h-64">
				<span className="block loading loading-ring loading-lg " />
			</div>
		</div>
	);
};

export default Loading;
