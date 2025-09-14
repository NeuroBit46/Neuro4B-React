import PropTypes from 'prop-types';

export const WorkerInput = ({
  label,
  icon,
  value,
  placeholder,
  onChange,
  disabled,
  inputClass = '',
}) => {
  return (
    <div>
      <label className="block text-xs text-primary-text font-medium mb-1">
        {label}
      </label>
      <div className="flex w-full items-center bg-secondary-bg p-3 rounded-sm shadow-xs focus-within:ring-1 focus-within:ring-primary">
        <span>{icon}</span>
        <input
          type="text"
          className={`flex-1 bg-transparent px-3 text-xs focus:outline-none ${inputClass}`}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

WorkerInput.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  inputClass: PropTypes.string,
};
