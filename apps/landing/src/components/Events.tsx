'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Events: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const upcomingEvents = [
    {
      id: '1',
      title: 'Weekend Mountain Ride',
      date: '24',
      month: 'OCT',
      time: '09:00',
      organizer: 'John Miller',
      participants: 18,
      maxParticipants: 25,
      image: 'https://picsum.photos/id/30/800/400',
    },
    {
      id: '2',
      title: 'Urban Night Cruise',
      date: '15',
      month: 'NOV',
      time: '20:00',
      organizer: 'Sarah Thompson',
      participants: 34,
      maxParticipants: 50,
      image: 'https://picsum.photos/id/65/800/400',
    },
    {
      id: '3',
      title: 'Beachside Gathering',
      date: '03',
      month: 'DEC',
      time: '10:30',
      organizer: 'Mike Chen',
      participants: 27,
      maxParticipants: 40,
      image: 'https://picsum.photos/id/26/800/400',
    },
  ];

  return (
    <section id="events" className="py-16 md:py-24">
      <div className="container-section">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title">Join Exciting Events</h2>
          <p className="text-neutral-grey text-lg">
            Find local rides, meetups, and gatherings or organize your own events to connect with fellow motorcycle enthusiasts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-neutral-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-40">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-neutral-white p-2 rounded-lg shadow-md text-center">
                  <div className="text-xl font-bold text-primary-main">{event.date}</div>
                  <div className="text-xs font-semibold">{event.month}</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="flex items-center text-sm text-neutral-grey mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{event.time}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-gray-300 mr-2"></div>
                    <span className="text-sm">{event.organizer}</span>
                  </div>
                  <div className="text-xs bg-primary-light bg-opacity-10 text-primary-main px-2 py-1 rounded-full">
                    {event.participants}/{event.maxParticipants} riders
                  </div>
                </div>
                <button className="w-full py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors">
                  Join Event
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-primary-main to-primary-dark rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Create Your Own Event</h3>
              <p className="mb-6">
                Planning a group ride or motorcycle meetup? Create and promote your event within the Motorove community.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Easy event setup with location, route, and details",
                  "Invite friends or open to all community members",
                  "Track RSVPs and communicate with participants",
                  "Share photos and stories after the event"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-white text-primary-main px-6 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors">
                Get Started
              </button>
            </div>
            <div className="relative h-[300px] hidden md:block">
              <div className="absolute top-0 right-0">
                <Image
                  src="/assets/images/create-event.png"
                  alt="Create Event Screen"
                  width={250}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Events;
