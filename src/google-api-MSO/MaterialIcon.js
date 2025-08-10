export const MaterialIcon = ({ 
    iconName, 
    size = 33.4, 
    color = 'currentColor', 
    filled = true,
    weight = 200,
    grade = 0,
    opticalSize = 20,
    className = '',
    ...props 
  }) => {
    const style = {
      fontSize: size,
      color,
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      ...props.style
    };
  
    return (
      <span 
        className={`material-symbols-outlined ${className}`}
        style={style}
        {...props}
      >
        {iconName}
      </span>
    );
  };