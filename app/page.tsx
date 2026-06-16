import BookSearch from "./BookSearch";

export default function Home() {
  return (
    <main>
      <BookSearch />

      <div>
        <h3>
          Readers like you have understood and/or solved real world tough
          problems after reading these
        </h3>
        <ul>
          <li>Outlive</li>
          <li>Why we sleep?</li>
          <li>Atomic Habits</li>
          <li>The Last Lecture</li>
          <li>How to Win Friends and Influence People</li>
          <li>Think and Grow Rich</li>
        </ul>
      </div>

      <div>
        <h3>
          Leverage ISBNDB API to support readers solving hard problems in
          daily life
        </h3>
        <p>What kind of book applications are you interested in?</p>
        <p>Would you like to pay for access to our full book database?</p>
      </div>
    </main>
  );
}
