export interface RootState {
  auth: {
    user: {
      _id: string;
      name: string;
      email: string;
      avatar: {
        public_id: string;
        url: string;
      };
    } | null;
  };
}
