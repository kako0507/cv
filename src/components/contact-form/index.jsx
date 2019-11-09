import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
} from 'react';
import classNames from 'classnames';
import useForm from 'react-hook-form';
import Title from '../title';
import Field from './field';

const ContactForm = forwardRef((props, ref) => {
  const [isLoading, setLoading] = useState(false);
  const refForm = useRef(null);
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = useCallback(() => {
    setLoading(true);
    const formData = new FormData(refForm.current);
    const req = new XMLHttpRequest();
    req.open(
      'POST',
      'https://getform.io/f/b2aeea64-fabd-4eae-a6db-b45d00e45cd4',
      true,
    );
    req.onload = () => {
      if (req.status === 200) {
        setLoading(false);
      }
    };
    req.send(formData);
  }, []);
  return (
    <section
      id="contact"
      ref={ref}
      className="section is-small"
    >
      <div className="container is-small">
        <Title className="has-text-centered">
          Contact Me
        </Title>
        <div
          ref={ref}
          className="columns is-centered"
        >
          <div className="column is-half">
            <form
              ref={refForm}
              action="#"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Field
                ref={register({ required: 'Name is required' })}
                type="text"
                name="name"
                error={errors.name}
                placeholder="Name*"
              />
              <Field
                ref={register({
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: 'Invalid email address.',
                  },
                })}
                type="text"
                name="email"
                error={errors.email}
                placeholder="Email*"
              />
              <Field
                ref={register({
                  required: 'Message is required',
                })}
                type="textarea"
                name="message"
                error={errors.message}
                placeholder="Message*"
              />
              <Field
                type="submit"
                align="center"
                className={classNames(
                  'is-primary',
                  {
                    'is-loading': isLoading,
                  },
                )}
              >
                Submit
              </Field>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ContactForm;
