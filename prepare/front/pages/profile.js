import React, { useEffect } from "react";
import Head from "next/head";
import { useSelector, useDispatch } from "react-redux";
import Router from "next/router";
import { END } from "redux-saga";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import useSWR from "swr";

// fetcher를 다른 것으로 바꾸면 graphql도 쓸 수 있음
const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((result) => result.data);

const Profile = () => {
  const dispatch = useDispatch();

  const { me } = useSelector((state) => state.user);

  const { data: followersData, error: followerError } = useSWR(
    `http://localhost:3065/user/followers`,
    fetcher
  );

  const { data: followingsData, error: followingError } = useSWR(
    `http://localhost:3065/user/followings`,
    fetcher
  );

  useEffect(() => {
    if (!(me && me.id)) {
      Router.push("/");
    }
  }, [me && me.id]);

  if (!me) {
    return "내 정보 로딩 중";
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return "팔로잉/팔로워 로딩 중 에러가 발생했습니다.";
  }

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉" data={followingsData} />
        <FollowList header="팔로워" data={followersData} />
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  async (context) => {
    const cookie = context.req ? context.req.headers.cookie : "";
    axios.defaults.headers.Cookie = "";

    if (context.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }
    context.store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });

    context.store.dispatch(END);
    await context.store.sagaTask.toPromise();
  }
);

export default Profile;
