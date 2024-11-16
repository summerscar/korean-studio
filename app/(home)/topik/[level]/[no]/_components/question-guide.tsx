import type { JSX } from "react";

const Wrapper = ({ children }: { children: string }) => {
	return (
		<div
			className="whitespace-pre-wrap pt-2 border-base-content"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
			dangerouslySetInnerHTML={{ __html: children }}
		/>
	);
};

const guide: Record<number, JSX.Element> = {
	0: (
		<Wrapper>{`<strong>※ [1~4] 다음을 듣고 <보기>와 같이 물음에 맞는 대답을 고르십시오.</strong>
							<보 기>
가:공부를해요?
나:_____________________________
❶ 네,공부를해요. 			②아니요,공부예요.
③네,공부가아니에요. 	 ④아니요,공부를좋아해요`}</Wrapper>
	),
	4: (
		<Wrapper>{`<strong>※ [5~6] 다음을 듣고 <보기>와 같이 다음 말에 이어지는 것을 고르십시오.</strong>
							<보 기>
가:맛있게드습니다.
나:_____________________________
①좋겠습니다.		 ②모르겠습니다.
③잘지냉습니다. 		❹ 잘먹겠습니다.`}</Wrapper>
	),
	6: (
		<Wrapper>{`<strong>※ [7~10] 여기는 어디입니까? <보기>와 같이 알맞은 것을 고르십시오.</strong>
							<보 기>
가:어떻게오셨어요?
나:이거한국돈으로바꿔주세요.
①가게 	②공원 	❸ 은행 	④병원`}</Wrapper>
	),
	10: (
		<Wrapper>{`<strong>※ [11~14] 다음은 무엇에 대해 말하고 있습니까? <보기>와 같이 알맞은것을 고르십시오.</strong>
							<보 기>
가:누구예요?
나:이사람은형이고,이사람은동생이에요.
❶ 가족 	②나라 	③고향 	④운동`}</Wrapper>
	),
	14: (
		<Wrapper>
			{
				"<strong>※ [15~16] 다음 대화를 듣고 알맞은 그림을 고르십시오. (각 4점)</strong>"
			}
		</Wrapper>
	),
	16: (
		<Wrapper>{`<strong>※ [17~21] 다음을 듣고 <보기>와 같이 대화 내용과 같은 것을 고르십시오.(각 3점)</strong>
							<보 기>
남자:요즘한국어를공부해요?
여자:네.한국친구한테서한국어를배워요.
①남자는학생입니다. 				②여자는학교에다닙니다.
③남자는한국어를가르칩니다. 	❹ 여자는한국어를공부합니다.`}</Wrapper>
	),
	21: (
		<Wrapper>
			{
				"<strong>※ [22~24] 다음을 듣고 대화 내용과 같은 것을 고르십시오. (각 3점)</strong>"
			}
		</Wrapper>
	),
	24: (
		<Wrapper>
			{"<strong>※ [25~26] 다음을 듣고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	26: (
		<Wrapper>
			{"<strong>※ [27~28] 다음을 듣고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	28: (
		<Wrapper>
			{"<strong>※ [29~30] 다음을 듣고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	30: (
		<Wrapper>{`<strong>※ [31~33] 무엇에 대한 이야기입니까? <보기>와 같이 알맞은 것을 고르십시오.</strong>
						<보 기>
덥습니다.바다에서수영합니다.
❶ 여름 	②날씨 	③나이 	④나라`}</Wrapper>
	),
	33: (
		<Wrapper>{`<strong>※ [34~39] <보기>와 같이 (   )에 들어갈 가장 알맞은 것을 고르십시오.</strong>
						<보 기>
날씨가좋습니다.( )이맑습니다.
①눈 	②밤 	❸ 하늘 	④구름`}</Wrapper>
	),
	39: (
		<Wrapper>
			{
				"<strong>※ [40～42]다음을 읽고 맞지 <u>않는</u> 것을 고르십시오.</strong>"
			}
		</Wrapper>
	),
	42: (
		<Wrapper>
			{"<strong>※ [43~45] 다음의 내용과 같은 것을 고르십시오.</strong>"}
		</Wrapper>
	),
	45: (
		<Wrapper>
			{"<strong>※ [46~48] 다음을 읽고 중심 생각을 고르십시오.</strong>"}
		</Wrapper>
	),
	48: (
		<Wrapper>
			{"<strong>※ [49~50] 다음을 읽고 물음에 답하십시오. (각 2점)</strong>"}
		</Wrapper>
	),
	50: (
		<Wrapper>
			{"<strong>※ [51~52] 다음을 읽고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	52: (
		<Wrapper>
			{"<strong>※ [53~54] 다음을 읽고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	54: (
		<Wrapper>
			{"<strong>※ [55~56] 다음을 읽고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	56: (
		<Wrapper>
			{
				"<strong>※ [57~58] 다음을 순서대로 맞게 나열한 것을 고르십시오.</strong>"
			}
		</Wrapper>
	),
	58: (
		<Wrapper>
			{"<strong>※ [59~60] 다음을 읽고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	60: (
		<Wrapper>
			{"<strong>※ [61~62] 다음을 읽고 물음에 답하십시오. (각 2점)</strong>"}
		</Wrapper>
	),
	62: (
		<Wrapper>
			{"<strong>※ [63~64] 다음을 읽고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	64: (
		<Wrapper>
			{"<strong>※ [65~66] 다음을 읽고 물음에 답하십시오.</strong>"}
		</Wrapper>
	),
	66: (
		<Wrapper>
			{"<strong>※ [67~68] 다음을 읽고 물음에 답하십시오. (각 3점)</strong>"}
		</Wrapper>
	),
	68: (
		<Wrapper>
			{"<strong>※ [69~70] 다음을 읽고 물음에 답하십시오. (각 3점)</strong>"}
		</Wrapper>
	),
};

export { guide };
