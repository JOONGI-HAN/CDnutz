
function LoginButton({ className = "" }) {
  return (
    <a
      className = {`px-4 py-2 text-[12px] font-semibold tracking-[0.8px] text-white
                   rounded-full cursor-pointer border border-[var(--accent-bright)]
                   bg-[image:var(--accent-color)] whitespace-nowrap ${className}`}
    >
      LOGIN TO ACCOUNT
    </a>
  );
}

export default LoginButton;
