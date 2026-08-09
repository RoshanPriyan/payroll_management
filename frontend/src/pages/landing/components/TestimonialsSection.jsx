const testimonials = [
  {
    rating: 5,
    quote: 'PayrollPro cut our payroll processing time in half. The attendance integration is seamless.',
    name: 'Aditi Sharma',
    role: 'HR Manager, Nimbus Retail',
    avatar: 'A',
  },
  {
    rating: 5,
    quote: 'Managing daily wage workers across three sites used to be a nightmare. Not anymore.',
    name: 'Rahul Verma',
    role: 'Operations Head, BuildRight Co.',
    avatar: 'R',
  },
  {
    rating: 4.5,
    quote: 'The multi-tenant support let us onboard all our franchise branches in a single day.',
    name: 'Sara Thomas',
    role: 'Founder, GreenLeaf Cafes',
    avatar: 'S',
  },
];

function Stars({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="stars mb-2" aria-label={`${rating} star rating`}>
      {Array.from({ length: fullStars }, (_, index) => (
        <i key={index} className="fa-solid fa-star" aria-hidden="true" />
      ))}
      {hasHalfStar && <i className="fa-solid fa-star-half-stroke" aria-hidden="true" />}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="section-pad">
      <div className="container text-center">
        <div className="reveal">
          <div className="eyebrow">Testimonials</div>
          <h2 className="section-title mt-2">Loved by businesses everywhere</h2>
        </div>

        <div className="landing-grid testimonials-grid mt-4">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card reveal" key={testimonial.name}>
              <Stars rating={testimonial.rating} />
              <p>"{testimonial.quote}"</p>
              <div className="testimonial-author mt-3">
                <div className="avatar-circle">{testimonial.avatar}</div>
                <div>
                  <strong>{testimonial.name}</strong>
                  <p className="text-muted-custom mb-0">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
