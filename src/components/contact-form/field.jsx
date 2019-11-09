import React, {
  forwardRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './form.scss';

const Field = forwardRef(
  (
    {
      name,
      type,
      className,
      align,
      placeholder,
      error,
      children,
    },
    ref,
  ) => {
    let TagName;
    let t;
    let cn;
    switch (type) {
      case 'text':
        TagName = 'input';
        t = 'text';
        break;
      case 'submit':
        TagName = 'button';
        t = 'submit';
        cn = 'button';
        break;
      default:
        TagName = type;
    }
    return (
      <div
        className={classNames(
          'field',
          styles.field,
        )}
      >
        <div
          className="control"
          style={{
            textAlign: align,
          }}
        >
          <TagName
            ref={ref}
            type={t}
            name={name}
            className={classNames(
              TagName,
              cn,
              {
                'is-danger': error,
              },
              className,
            )}
            placeholder={placeholder}
          >
            {children}
          </TagName>
          {error?.message && (
            <p className="help is-danger">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Field.propTypes = {
  name: PropTypes.string,
  type: PropTypes.oneOf([
    'text',
    'textarea',
    'submit',
  ]).isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf([
    'left',
    'right',
    'center',
    'justify',
    'inherit',
    'start',
    'end',
  ]),
  placeholder: PropTypes.string,
  error: PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string,
  }),
  children: PropTypes.node,
};

Field.defaultProps = {
  name: undefined,
  className: undefined,
  align: undefined,
  placeholder: undefined,
  error: undefined,
  children: undefined,
};

export default Field;
