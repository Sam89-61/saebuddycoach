function FooterBoutton({ href, svgPath, svgFill }) {
    return (
        <a href={href}>
            <svg href="main.jsx" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={svgFill}>
                <path d={svgPath}></path>
            </svg>
        </a>
    );
}
export default FooterBoutton;